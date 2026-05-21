use std::collections::HashMap;

use axum::{
    body::Bytes,
    extract::{Path, Query, State},
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde_json::{json, Map, Value};

use crate::{
    ai, auth,
    error::ApiError,
    payments,
    state::{new_id, timestamp_json, ApiState, ApiTimestamp, Conversation, Message},
};

const VALID_DOCUMENT_TYPES: &[&str] = &[
    "FIR",
    "RTI",
    "COMPLAINT",
    "BAIL_APPLICATION",
    "NOTICE",
    "AGREEMENT",
    "AFFIDAVIT",
    "OTHER",
];

pub async fn healthz() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "satyavera-api" }))
}

pub async fn post_chat(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Result<impl IntoResponse, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    if !state.rate_limit(&format!("chat-{user_id}"), 10) {
        return Err(ApiError::too_many_requests("Too many requests"));
    }
    let messages = body
        .get("messages")
        .and_then(Value::as_array)
        .ok_or_else(|| ApiError::bad_request("Messages array is required"))?;
    ai::validate_messages(messages)?;
    let response = ai::fallback_chat_response(messages);
    Ok((
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
        response,
    ))
}

pub async fn get_conversations(
    State(state): State<ApiState>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let mut conversations = state.with_store(|store| {
        store
            .conversations
            .values()
            .filter(|conversation| conversation.user_id == user_id)
            .cloned()
            .collect::<Vec<_>>()
    });
    conversations.sort_by_key(|conversation| std::cmp::Reverse(conversation.updated_at.seconds));
    conversations.truncate(50);
    Ok(Json(json!({ "conversations": conversations })))
}

pub async fn post_conversation(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Result<(StatusCode, Json<Value>), ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    if !state.rate_limit(&format!("conversations-{user_id}"), 10) {
        return Err(ApiError::too_many_requests("Too many requests"));
    }
    let now = ApiTimestamp::now();
    let conversation = Conversation {
        id: new_id(),
        user_id,
        title: body
            .get("title")
            .and_then(Value::as_str)
            .filter(|value| !value.is_empty())
            .unwrap_or("New Conversation")
            .to_owned(),
        category: body
            .get("category")
            .and_then(Value::as_str)
            .map(str::to_owned),
        language: body
            .get("language")
            .and_then(Value::as_str)
            .unwrap_or("en")
            .to_owned(),
        created_at: now.clone(),
        updated_at: now,
    };
    let value = serde_json::to_value(&conversation).expect("conversation serializes");
    state.journal_put(&format!("conversations/{}", conversation.id), &value)?;
    state.with_store(|store| {
        store
            .conversations
            .insert(conversation.id.clone(), conversation.clone());
    });
    Ok((StatusCode::CREATED, Json(json!({ "id": conversation.id }))))
}

pub async fn get_conversation(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let (conversation, messages) = state.with_store(|store| {
        let conversation = store.conversations.get(&id).cloned();
        let messages = store.messages.get(&id).cloned().unwrap_or_default();
        (conversation, messages)
    });
    let conversation = conversation.ok_or_else(|| ApiError::not_found("Conversation not found"))?;
    if conversation.user_id != user_id {
        return Err(ApiError::forbidden("Unauthorized"));
    }
    Ok(Json(
        json!({ "conversation": conversation, "messages": messages }),
    ))
}

pub async fn delete_conversation(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let conversation = state.with_store(|store| store.conversations.get(&id).cloned());
    let conversation = conversation.ok_or_else(|| ApiError::not_found("Conversation not found"))?;
    if conversation.user_id != user_id {
        return Err(ApiError::forbidden("Unauthorized"));
    }
    state.journal_delete(&format!("conversations/{id}"))?;
    state.journal_delete(&format!("conversations/{id}/messages"))?;
    state.with_store(|store| {
        store.conversations.remove(&id);
        store.messages.remove(&id);
    });
    Ok(Json(json!({ "success": true })))
}

pub async fn post_conversation_message(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(body): Json<Value>,
) -> Result<(StatusCode, Json<Value>), ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let conversation = state.with_store(|store| store.conversations.get(&id).cloned());
    let mut conversation =
        conversation.ok_or_else(|| ApiError::not_found("Conversation not found"))?;
    if conversation.user_id != user_id {
        return Err(ApiError::forbidden("Unauthorized"));
    }
    let role = body
        .get("role")
        .and_then(Value::as_str)
        .ok_or_else(|| ApiError::bad_request(r#"role must be "user" or "assistant""#))?;
    if role != "user" && role != "assistant" {
        return Err(ApiError::bad_request(
            r#"role must be "user" or "assistant""#,
        ));
    }
    let content = body
        .get("content")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| ApiError::bad_request("content must be a non-empty string"))?;
    if content.len() > 10_000 {
        return Err(ApiError::bad_request(
            "content must be at most 10000 characters",
        ));
    }
    let citations = match body.get("citations") {
        Some(Value::Array(values)) => values
            .iter()
            .map(|value| {
                value
                    .as_str()
                    .map(str::to_owned)
                    .ok_or_else(|| ApiError::bad_request("each citation must be a string"))
            })
            .collect::<Result<Vec<_>, _>>()?,
        Some(_) => return Err(ApiError::bad_request("citations must be an array")),
        None => Vec::new(),
    };
    let message = Message {
        id: new_id(),
        role: role.to_owned(),
        content: content.to_owned(),
        citations,
        created_at: ApiTimestamp::now(),
    };
    conversation.updated_at = ApiTimestamp::now();
    if role == "user"
        && body
            .get("updateTitle")
            .and_then(Value::as_bool)
            .unwrap_or(false)
    {
        conversation.title = if content.chars().count() > 60 {
            format!("{}...", content.chars().take(60).collect::<String>())
        } else {
            content.to_owned()
        };
    }
    let message_value = serde_json::to_value(&message).expect("message serializes");
    let conversation_value = serde_json::to_value(&conversation).expect("conversation serializes");
    state.journal_put(
        &format!("conversations/{id}/messages/{}", message.id),
        &message_value,
    )?;
    state.journal_put(&format!("conversations/{id}"), &conversation_value)?;
    state.with_store(|store| {
        store.conversations.insert(id.clone(), conversation);
        store.messages.entry(id).or_default().push(message.clone());
    });
    Ok((StatusCode::CREATED, Json(json!({ "id": message.id }))))
}

pub async fn get_documents(
    State(state): State<ApiState>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let mut documents = state.with_store(|store| {
        store
            .documents
            .values()
            .filter(|document| {
                document.get("userId").and_then(Value::as_str) == Some(user_id.as_str())
            })
            .cloned()
            .collect::<Vec<_>>()
    });
    documents.sort_by_key(|document| {
        std::cmp::Reverse(
            document
                .pointer("/updatedAt/_seconds")
                .and_then(Value::as_i64)
                .unwrap_or(0),
        )
    });
    documents.truncate(20);
    Ok(Json(json!({ "documents": documents })))
}

pub async fn post_document(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    if !state.rate_limit(&format!("documents-{user_id}"), 5) {
        return Err(ApiError::too_many_requests("Too many requests"));
    }
    let type_name = body
        .get("type")
        .and_then(Value::as_str)
        .ok_or_else(|| ApiError::bad_request("Type and details are required"))?;
    if !VALID_DOCUMENT_TYPES.contains(&type_name) {
        return Err(ApiError::bad_request(format!(
            "type must be one of: {}",
            VALID_DOCUMENT_TYPES.join(", ")
        )));
    }
    let details = body
        .get("details")
        .and_then(Value::as_object)
        .ok_or_else(|| ApiError::bad_request("details must be an object"))?;
    for (key, value) in details {
        if !value.is_string() {
            return Err(ApiError::bad_request(format!(
                "details.{key} must be a string"
            )));
        }
    }
    let content = ai::generate_document(type_name, details);
    let id = new_id();
    let document = json!({
        "id": id,
        "userId": user_id,
        "type": type_name,
        "title": details.get("title").and_then(Value::as_str).unwrap_or(type_name),
        "content": content,
        "status": "DRAFT",
        "createdAt": timestamp_json(),
        "updatedAt": timestamp_json()
    });
    state.journal_put(&format!("documents/{id}"), &document)?;
    state.with_store(|store| {
        store.documents.insert(id.clone(), document.clone());
    });
    Ok(Json(json!({
        "id": id,
        "content": content,
        "type": type_name,
        "status": "DRAFT"
    })))
}

pub async fn get_guides(
    State(state): State<ApiState>,
    Query(params): Query<HashMap<String, String>>,
) -> Json<Value> {
    let category = params.get("category").map(String::as_str);
    let mut guides = state.with_store(|store| {
        filter_by_category(&store.guides, category)
            .into_iter()
            .take(50)
            .collect::<Vec<_>>()
    });
    sort_values(&mut guides, "order");
    Json(json!({ "guides": guides }))
}

pub async fn get_templates(
    State(state): State<ApiState>,
    Query(params): Query<HashMap<String, String>>,
) -> Json<Value> {
    let category = params.get("category").map(String::as_str);
    let mut templates = state.with_store(|store| {
        filter_by_category(&store.templates, category)
            .into_iter()
            .take(50)
            .collect::<Vec<_>>()
    });
    sort_values(&mut templates, "order");
    Json(json!({ "templates": templates }))
}

pub async fn get_dictionary(
    State(state): State<ApiState>,
    Query(params): Query<HashMap<String, String>>,
) -> Json<Value> {
    let letter = params.get("letter").map(|value| value.to_uppercase());
    let category = params.get("category").map(String::as_str);
    let search = params.get("search").map(|value| value.to_lowercase());
    let mut entries = state.with_store(|store| {
        store
            .dictionary_entries
            .iter()
            .filter(|entry| {
                letter.as_ref().is_none_or(|letter| {
                    entry.get("letter").and_then(Value::as_str) == Some(letter.as_str())
                })
            })
            .filter(|entry| category_matches(entry, category))
            .filter(|entry| {
                search.as_ref().is_none_or(|search| {
                    contains_lower(entry, "termEn", search)
                        || entry
                            .get("termHi")
                            .and_then(Value::as_str)
                            .is_some_and(|value| value.contains(search))
                        || contains_lower(entry, "definitionEn", search)
                })
            })
            .take(200)
            .cloned()
            .collect::<Vec<_>>()
    });
    entries.sort_by(|left, right| {
        let left = left
            .get("termEn")
            .and_then(Value::as_str)
            .unwrap_or_default();
        let right = right
            .get("termEn")
            .and_then(Value::as_str)
            .unwrap_or_default();
        left.cmp(right)
    });
    Json(json!({ "entries": entries }))
}

pub async fn get_lawyers(
    State(state): State<ApiState>,
    Query(params): Query<HashMap<String, String>>,
) -> Json<Value> {
    let area = params.get("area").map(String::as_str);
    let city = params.get("city").map(String::as_str);
    let sort = params.get("sort").map(String::as_str).unwrap_or("rating");
    let search = params.get("search").map(|value| value.to_lowercase());
    let mut lawyers = state.with_store(|store| {
        store
            .lawyers
            .iter()
            .filter(|lawyer| {
                area.is_none_or(|area| {
                    area == "all" || array_contains(lawyer, "practiceAreas", area)
                })
            })
            .filter(|lawyer| {
                city.is_none_or(|city| lawyer.get("city").and_then(Value::as_str) == Some(city))
            })
            .filter(|lawyer| {
                search
                    .as_ref()
                    .is_none_or(|search| contains_lower(lawyer, "name", search))
            })
            .take(50)
            .cloned()
            .collect::<Vec<_>>()
    });
    sort_values(&mut lawyers, sort);
    Json(json!({ "lawyers": lawyers }))
}

pub async fn get_laws(
    State(state): State<ApiState>,
    Query(params): Query<HashMap<String, String>>,
) -> Json<Value> {
    let category = params.get("category").map(String::as_str);
    let search = params.get("q").map(|value| value.to_lowercase());
    let laws = state.with_store(|store| {
        store
            .laws
            .summaries
            .iter()
            .filter(|law| {
                category.is_none_or(|category| {
                    category == "all"
                        || law.get("primaryCategory").and_then(Value::as_str) == Some(category)
                        || array_contains(law, "categories", category)
                })
            })
            .filter(|law| {
                search.as_ref().is_none_or(|search| {
                    contains_lower(law, "title", search)
                        || law
                            .get("hindiTitle")
                            .and_then(Value::as_str)
                            .is_some_and(|value| value.contains(search))
                })
            })
            .take(100)
            .cloned()
            .collect::<Vec<_>>()
    });
    Json(json!({ "laws": laws }))
}

pub async fn get_law(
    State(state): State<ApiState>,
    Path(slug): Path<String>,
) -> Result<Json<Value>, ApiError> {
    let law = state.with_store(|store| store.laws.by_slug.get(&slug).cloned());
    law.map(Json)
        .ok_or_else(|| ApiError::not_found("Law not found"))
}

pub async fn get_law_sections(
    State(state): State<ApiState>,
    Path(slug): Path<String>,
) -> Json<Value> {
    let mut sections = state.with_store(|store| {
        store
            .laws
            .by_slug
            .get(&slug)
            .and_then(|law| law.get("sections"))
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .enumerate()
            .map(|(index, mut section)| {
                if section.get("id").is_none() {
                    if let Some(section_no) = section
                        .get("sectionNo")
                        .and_then(Value::as_str)
                        .map(str::to_owned)
                    {
                        section["id"] = Value::String(section_no);
                    }
                }
                if section.get("orderNo").is_none() {
                    section["orderNo"] = json!(index + 1);
                }
                section
            })
            .collect::<Vec<_>>()
    });
    sort_values(&mut sections, "orderNo");
    Json(json!({ "sections": sections }))
}

pub async fn get_subscription(
    State(state): State<ApiState>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let subscription = state.with_store(|store| {
        store
            .subscriptions
            .get(&user_id)
            .cloned()
            .unwrap_or_else(|| default_subscription(&user_id))
    });
    Ok(Json(json!({ "subscription": subscription })))
}

pub async fn post_subscription_usage(
    State(state): State<ApiState>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let today = today();
    let mut subscription = state.with_store(|store| {
        store
            .subscriptions
            .get(&user_id)
            .cloned()
            .unwrap_or_else(|| default_subscription(&user_id))
    });
    if subscription.get("lastResetDate").and_then(Value::as_str) != Some(today.as_str()) {
        subscription["queriesUsedToday"] = json!(0);
        subscription["lastResetDate"] = json!(today);
    }
    let plan = subscription
        .get("plan")
        .and_then(Value::as_str)
        .unwrap_or("FREE");
    let limit = if plan == "FREE" { 5 } else { -1 };
    let used = subscription
        .get("queriesUsedToday")
        .and_then(Value::as_i64)
        .unwrap_or(0);
    if limit != -1 && used >= limit {
        return Ok(Json(
            json!({ "allowed": false, "used": used, "limit": limit }),
        ));
    }
    subscription["queriesUsedToday"] = json!(used + 1);
    state.journal_put(&format!("subscriptions/{user_id}"), &subscription)?;
    state.with_store(|store| {
        store
            .subscriptions
            .insert(user_id.clone(), subscription.clone());
    });
    Ok(Json(json!({
        "allowed": true,
        "used": used + 1,
        "limit": limit
    })))
}

pub async fn get_settings(
    State(state): State<ApiState>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let profile = state.with_store(|store| {
        store
            .users
            .get(&user_id)
            .cloned()
            .unwrap_or_else(|| default_profile(&user_id))
    });
    Ok(Json(json!({ "profile": profile })))
}

pub async fn put_settings(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let body = body
        .as_object()
        .ok_or_else(|| ApiError::bad_request("Body must be an object"))?;
    validate_settings_fields(body)?;
    let mut profile = state.with_store(|store| {
        store
            .users
            .get(&user_id)
            .cloned()
            .unwrap_or_else(|| default_profile(&user_id))
    });
    let allowed_fields = [
        "name",
        "phone",
        "language",
        "state",
        "city",
        "district",
        "pincode",
        "image",
        "emergencyContact",
        "notifications",
        "privacySettings",
        "barCouncilNumber",
        "barCouncilState",
        "yearsOfPractice",
        "specializations",
        "courts",
    ];
    for field in allowed_fields {
        if let Some(value) = body.get(field) {
            profile[field] = value.clone();
        }
    }
    profile["updatedAt"] = timestamp_json();
    state.journal_put(&format!("users/{user_id}"), &profile)?;
    state.with_store(|store| {
        store.users.insert(user_id.clone(), profile.clone());
    });
    Ok(Json(json!({ "profile": profile })))
}

pub async fn get_consultations(
    State(state): State<ApiState>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let profile = state.with_store(|store| {
        store
            .users
            .get(&user_id)
            .cloned()
            .unwrap_or_else(|| default_profile(&user_id))
    });
    let field = if profile.get("role").and_then(Value::as_str) == Some("ADVOCATE") {
        "lawyerId"
    } else {
        "citizenId"
    };
    let consultations = state.with_store(|store| {
        store
            .consultations
            .values()
            .filter(|consultation| {
                consultation.get(field).and_then(Value::as_str) == Some(user_id.as_str())
            })
            .take(50)
            .cloned()
            .collect::<Vec<_>>()
    });
    Ok(Json(json!({ "consultations": consultations })))
}

pub async fn post_consultation(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Result<(StatusCode, Json<Value>), ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    if !state.rate_limit(&format!("consultations-{user_id}"), 5) {
        return Err(ApiError::too_many_requests("Too many requests"));
    }
    let lawyer_id = body
        .get("lawyerId")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| ApiError::bad_request("lawyerId and topic are required"))?;
    let topic = body
        .get("topic")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| ApiError::bad_request("lawyerId and topic are required"))?;
    let profile = state.with_store(|store| {
        store
            .users
            .get(&user_id)
            .cloned()
            .unwrap_or_else(|| default_profile(&user_id))
    });
    let id = new_id();
    let consultation = json!({
        "id": id,
        "citizenId": user_id,
        "lawyerId": lawyer_id,
        "citizenName": profile.get("name").and_then(Value::as_str).unwrap_or("Anonymous"),
        "topic": topic,
        "mode": body.get("mode").and_then(Value::as_str).unwrap_or("phone"),
        "status": "PENDING",
        "notes": body.get("notes").and_then(Value::as_str).unwrap_or(""),
        "fee": body.get("fee").and_then(Value::as_str).unwrap_or(""),
        "createdAt": timestamp_json(),
        "updatedAt": timestamp_json()
    });
    state.journal_put(&format!("consultationRequests/{id}"), &consultation)?;
    state.with_store(|store| {
        store.consultations.insert(id.clone(), consultation);
    });
    Ok((StatusCode::CREATED, Json(json!({ "id": id }))))
}

pub async fn patch_consultation(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(body): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let status = body.get("status").and_then(Value::as_str).ok_or_else(|| {
        ApiError::bad_request("Valid status is required (ACCEPTED, DECLINED, COMPLETED)")
    })?;
    if !matches!(status, "ACCEPTED" | "DECLINED" | "COMPLETED") {
        return Err(ApiError::bad_request(
            "Valid status is required (ACCEPTED, DECLINED, COMPLETED)",
        ));
    }
    let consultation = state.with_store(|store| store.consultations.get(&id).cloned());
    let mut consultation =
        consultation.ok_or_else(|| ApiError::not_found("Consultation not found"))?;
    let lawyer_id = consultation.get("lawyerId").and_then(Value::as_str);
    let citizen_id = consultation.get("citizenId").and_then(Value::as_str);
    if lawyer_id != Some(user_id.as_str()) && citizen_id != Some(user_id.as_str()) {
        return Err(ApiError::forbidden("Unauthorized"));
    }
    if matches!(status, "ACCEPTED" | "DECLINED") && lawyer_id != Some(user_id.as_str()) {
        return Err(ApiError::forbidden(
            "Only the advocate can accept or decline a consultation",
        ));
    }
    if let Some(scheduled_at) = body.get("scheduledAt") {
        let scheduled_at = scheduled_at
            .as_str()
            .ok_or_else(|| ApiError::bad_request("scheduledAt must be a valid ISO date string"))?;
        chrono::DateTime::parse_from_rfc3339(scheduled_at)
            .map_err(|_| ApiError::bad_request("scheduledAt must be a valid ISO date string"))?;
        consultation["scheduledAt"] = json!(scheduled_at);
    }
    if let Some(notes) = body.get("notes") {
        let notes = notes
            .as_str()
            .ok_or_else(|| ApiError::bad_request("notes must be a string"))?;
        if notes.len() > 1000 {
            return Err(ApiError::bad_request(
                "notes must be at most 1000 characters",
            ));
        }
        consultation["notes"] = json!(notes);
    }
    consultation["status"] = json!(status);
    consultation["updatedAt"] = timestamp_json();
    state.journal_put(&format!("consultationRequests/{id}"), &consultation)?;
    state.with_store(|store| {
        store.consultations.insert(id, consultation);
    });
    Ok(Json(json!({ "success": true })))
}

pub async fn get_quizzes(State(state): State<ApiState>) -> Json<Value> {
    let mut quizzes = state.with_store(|store| store.quizzes.clone());
    sort_values(&mut quizzes, "order");
    Json(json!({ "quizzes": quizzes }))
}

pub async fn get_quiz(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>, ApiError> {
    auth::require_user(&headers, &state).await?;
    let (quiz, questions) = state.with_store(|store| {
        (
            store
                .quizzes
                .iter()
                .find(|quiz| quiz.get("id").and_then(Value::as_str) == Some(id.as_str()))
                .cloned(),
            store.quiz_questions.get(&id).cloned().unwrap_or_default(),
        )
    });
    let quiz = quiz.ok_or_else(|| ApiError::not_found("Quiz not found"))?;
    let questions = questions
        .into_iter()
        .map(|question| {
            json!({
                "id": question.get("id").cloned().unwrap_or(Value::Null),
                "question": question.get("question").cloned().unwrap_or(Value::Null),
                "questionHi": question.get("questionHi").cloned().unwrap_or(Value::Null),
                "options": question.get("options").cloned().unwrap_or(Value::Null),
                "optionsHi": question.get("optionsHi").cloned().unwrap_or(Value::Null),
                "lawReference": question.get("lawReference").cloned().unwrap_or(Value::Null),
                "order": question.get("order").cloned().unwrap_or(Value::Null)
            })
        })
        .collect::<Vec<_>>();
    Ok(Json(json!({ "quiz": quiz, "questions": questions })))
}

pub async fn post_quiz_submit(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(body): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let answers = body
        .get("answers")
        .and_then(Value::as_array)
        .ok_or_else(|| ApiError::bad_request("answers array is required"))?;
    let questions = state.with_store(|store| store.quiz_questions.get(&id).cloned());
    let questions = questions.ok_or_else(|| ApiError::not_found("Quiz not found"))?;
    if answers.len() != questions.len() {
        return Err(ApiError::bad_request(format!(
            "Expected {} answers but received {}",
            questions.len(),
            answers.len()
        )));
    }
    let mut score = 0;
    let mut results = Vec::with_capacity(questions.len());
    for (index, answer) in answers.iter().enumerate() {
        let answer = answer.as_i64().ok_or_else(|| {
            ApiError::bad_request(format!(
                "Answer at index {index} must be a non-negative integer"
            ))
        })?;
        if answer < 0 {
            return Err(ApiError::bad_request(format!(
                "Answer at index {index} must be a non-negative integer"
            )));
        }
        let options_len = questions[index]
            .get("options")
            .and_then(Value::as_array)
            .map_or(0, Vec::len) as i64;
        if answer >= options_len {
            return Err(ApiError::bad_request(format!(
                "Answer at index {index} is out of bounds (max {})",
                options_len - 1
            )));
        }
        let correct_index = questions[index]
            .get("correctIndex")
            .and_then(Value::as_i64)
            .unwrap_or(-1);
        let correct = answer == correct_index;
        if correct {
            score += 1;
        }
        results.push(json!({
            "correct": correct,
            "correctIndex": correct_index,
            "userAnswer": answer,
            "explanation": questions[index].get("explanation").cloned().unwrap_or(Value::Null),
            "explanationHi": questions[index].get("explanationHi").cloned().unwrap_or(Value::Null)
        }));
    }
    let attempt_id = new_id();
    let attempt = json!({
        "quizId": id,
        "score": score,
        "totalQuestions": questions.len(),
        "completedAt": timestamp_json()
    });
    state.journal_put(
        &format!("users/{user_id}/quizAttempts/{attempt_id}"),
        &attempt,
    )?;
    Ok(Json(json!({
        "score": score,
        "totalQuestions": questions.len(),
        "results": results
    })))
}

pub async fn post_payment_order(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    if !state.rate_limit(&format!("payments-create-order-{user_id}"), 3) {
        return Err(ApiError::too_many_requests("Too many requests"));
    }
    let plan = body
        .get("plan")
        .and_then(Value::as_str)
        .ok_or_else(|| ApiError::bad_request("Plan and billing cycle are required"))?;
    let billing = body
        .get("billing")
        .and_then(Value::as_str)
        .ok_or_else(|| ApiError::bad_request("Plan and billing cycle are required"))?;
    let order = payments::create_order(&state, &user_id, plan, billing).await?;
    Ok(Json(order))
}

pub async fn post_payment_verify(
    State(state): State<ApiState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let user_id = auth::require_user(&headers, &state).await?;
    let secret = state
        .config()
        .razorpay_key_secret
        .as_deref()
        .ok_or_else(|| ApiError::service_unavailable("Payment service is not configured"))?;
    let order_id = required_string(&body, "razorpay_order_id")?;
    let payment_id = required_string(&body, "razorpay_payment_id")?;
    let signature = required_string(&body, "razorpay_signature")?;
    if !payments::verify_payment_signature(order_id, payment_id, signature, secret) {
        return Err(ApiError::bad_request(
            "Payment verification failed: invalid signature",
        ));
    }
    let order = state.with_store(|store| store.payment_orders.get(order_id).cloned());
    let order = order.ok_or_else(|| ApiError::bad_request("Payment order not found"))?;
    let notes = order.get("notes").and_then(Value::as_object);
    let plan = notes
        .and_then(|notes| notes.get("plan"))
        .and_then(Value::as_str)
        .ok_or_else(|| ApiError::bad_request("Invalid plan"))?;
    let billing = notes
        .and_then(|notes| notes.get("billing"))
        .and_then(Value::as_str)
        .unwrap_or("monthly");
    let expected_amount = payments::plan_amount(plan, billing)
        .ok_or_else(|| ApiError::bad_request("Invalid plan"))?;
    if order.get("amount").and_then(Value::as_i64) != Some(expected_amount) {
        return Err(ApiError::bad_request("Payment amount mismatch"));
    }
    let subscription = active_subscription(&user_id, plan, billing, payment_id, order_id);
    state.journal_put(&format!("subscriptions/{user_id}"), &subscription)?;
    state.with_store(|store| {
        store.subscriptions.insert(user_id, subscription);
    });
    Ok(Json(json!({ "success": true, "plan": plan })))
}

pub async fn post_payment_webhook(
    State(state): State<ApiState>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<Json<Value>, ApiError> {
    let secret = state
        .config()
        .razorpay_webhook_secret
        .as_deref()
        .ok_or_else(|| ApiError::service_unavailable("Webhook not configured"))?;
    let signature = headers
        .get("x-razorpay-signature")
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| ApiError::bad_request("Missing signature"))?;
    let raw = String::from_utf8(body.to_vec())
        .map_err(|_| ApiError::bad_request("Webhook body must be UTF-8 JSON"))?;
    if !payments::verify_webhook_signature(&raw, signature, secret) {
        return Err(ApiError::bad_request("Invalid signature"));
    }
    let event: Value = serde_json::from_str(&raw)?;
    let event_type = event
        .get("event")
        .and_then(Value::as_str)
        .unwrap_or_default();
    if event_type == "payment.captured" {
        if let Some(payment) = event.pointer("/payload/payment/entity") {
            let notes = payment.get("notes").and_then(Value::as_object);
            if let (Some(user_id), Some(plan)) = (
                notes
                    .and_then(|notes| notes.get("userId"))
                    .and_then(Value::as_str),
                notes
                    .and_then(|notes| notes.get("plan"))
                    .and_then(Value::as_str),
            ) {
                let billing = notes
                    .and_then(|notes| notes.get("billing"))
                    .and_then(Value::as_str)
                    .unwrap_or("monthly");
                let payment_id = payment
                    .get("id")
                    .and_then(Value::as_str)
                    .unwrap_or_default();
                let order_id = payment
                    .get("order_id")
                    .and_then(Value::as_str)
                    .unwrap_or_default();
                let subscription =
                    active_subscription(user_id, plan, billing, payment_id, order_id);
                state.journal_put(&format!("subscriptions/{user_id}"), &subscription)?;
                state.with_store(|store| {
                    store.subscriptions.insert(user_id.to_owned(), subscription);
                });
            }
        }
    }
    Ok(Json(json!({ "status": "ok" })))
}

fn filter_by_category(values: &[Value], category: Option<&str>) -> Vec<Value> {
    values
        .iter()
        .filter(|value| category_matches(value, category))
        .cloned()
        .collect()
}

fn category_matches(value: &Value, category: Option<&str>) -> bool {
    category.is_none_or(|category| {
        category == "all" || value.get("category").and_then(Value::as_str) == Some(category)
    })
}

fn array_contains(value: &Value, field: &str, expected: &str) -> bool {
    value
        .get(field)
        .and_then(Value::as_array)
        .is_some_and(|values| values.iter().any(|value| value.as_str() == Some(expected)))
}

fn contains_lower(value: &Value, field: &str, needle: &str) -> bool {
    value
        .get(field)
        .and_then(Value::as_str)
        .is_some_and(|value| value.to_lowercase().contains(needle))
}

fn sort_values(values: &mut [Value], sort: &str) {
    match sort {
        "experience" => values.sort_by(|left, right| {
            number_field(right, "experience").total_cmp(&number_field(left, "experience"))
        }),
        "fee_low" => values.sort_by(|left, right| {
            number_field(left, "feeAmount").total_cmp(&number_field(right, "feeAmount"))
        }),
        "order" => values.sort_by(|left, right| {
            number_field(left, "order").total_cmp(&number_field(right, "order"))
        }),
        "orderNo" => values.sort_by(|left, right| {
            number_field(left, "orderNo").total_cmp(&number_field(right, "orderNo"))
        }),
        _ => values.sort_by(|left, right| {
            number_field(right, "rating").total_cmp(&number_field(left, "rating"))
        }),
    }
}

fn number_field(value: &Value, field: &str) -> f64 {
    value.get(field).and_then(Value::as_f64).unwrap_or(0.0)
}

fn required_string<'a>(body: &'a Value, field: &str) -> Result<&'a str, ApiError> {
    body.get(field)
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| ApiError::bad_request("Missing payment verification parameters"))
}

fn validate_settings_fields(body: &Map<String, Value>) -> Result<(), ApiError> {
    if let Some(name) = body.get("name") {
        if name.as_str().is_none_or(|value| value.len() > 100) {
            return Err(ApiError::bad_request(
                "name must be a string with max 100 characters",
            ));
        }
    }
    if let Some(phone) = body.get("phone") {
        let Some(phone) = phone.as_str() else {
            return Err(ApiError::bad_request("phone must be a string"));
        };
        let rest = phone.strip_prefix('+').unwrap_or(phone);
        let valid_phone = phone.is_empty()
            || (!rest.is_empty()
                && rest.chars().all(|ch| ch.is_ascii_digit())
                && (7..=15).contains(&rest.len()));
        if !valid_phone {
            return Err(ApiError::bad_request(
                "phone must match format +XXXXXXXXXX (7-15 digits) or be empty",
            ));
        }
    }
    if let Some(language) = body.get("language") {
        if !matches!(language.as_str(), Some("en" | "hi")) {
            return Err(ApiError::bad_request(r#"language must be "en" or "hi""#));
        }
    }
    for field in ["state", "city", "district", "pincode"] {
        if let Some(value) = body.get(field) {
            if value.as_str().is_none_or(|value| value.len() > 100) {
                return Err(ApiError::bad_request(format!(
                    "{field} must be a string with max 100 characters"
                )));
            }
        }
    }
    if let Some(years) = body.get("yearsOfPractice") {
        let years = years.as_f64().ok_or_else(|| {
            ApiError::bad_request("yearsOfPractice must be a number between 0 and 80")
        })?;
        if !(0.0..=80.0).contains(&years) {
            return Err(ApiError::bad_request(
                "yearsOfPractice must be a number between 0 and 80",
            ));
        }
    }
    if let Some(specializations) = body.get("specializations") {
        let values = specializations
            .as_array()
            .ok_or_else(|| ApiError::bad_request("specializations must be an array"))?;
        if values.len() > 10 {
            return Err(ApiError::bad_request(
                "specializations can have at most 10 items",
            ));
        }
        for value in values {
            if value.as_str().is_none_or(|value| value.len() > 50) {
                return Err(ApiError::bad_request(
                    "each specialization must be a string with max 50 characters",
                ));
            }
        }
    }
    Ok(())
}

fn default_profile(user_id: &str) -> Value {
    json!({
        "id": user_id,
        "name": "SatyaVera User",
        "email": "",
        "role": "CITIZEN",
        "language": "en",
        "verified": false,
        "createdAt": timestamp_json(),
        "updatedAt": timestamp_json()
    })
}

fn default_subscription(user_id: &str) -> Value {
    json!({
        "id": user_id,
        "plan": "FREE",
        "status": "active",
        "queriesUsedToday": 0,
        "documentsUsedThisMonth": 0,
        "lastResetDate": today(),
        "lastDocResetDate": today()
    })
}

fn active_subscription(
    user_id: &str,
    plan: &str,
    billing: &str,
    payment_id: &str,
    order_id: &str,
) -> Value {
    json!({
        "id": user_id,
        "plan": plan,
        "status": "active",
        "razorpaySubscriptionId": payment_id,
        "razorpayPaymentId": payment_id,
        "razorpayOrderId": order_id,
        "billingCycle": billing,
        "currentPeriodStart": timestamp_json(),
        "updatedAt": timestamp_json()
    })
}

fn today() -> String {
    chrono::Utc::now().date_naive().to_string()
}
