use axum::{
    body::{to_bytes, Body},
    http::{header, Method, Request, StatusCode},
};
use satyavera_api::{app, ApiConfig, ApiState, API_ROUTE_SPECS};
use serde_json::{json, Value};
use tower::ServiceExt;

#[test]
fn route_specs_cover_migrated_next_api_surface() {
    let expected = [
        ("POST", "/api/chat"),
        ("GET", "/api/consultations"),
        ("POST", "/api/consultations"),
        ("PATCH", "/api/consultations/{id}"),
        ("GET", "/api/conversations"),
        ("POST", "/api/conversations"),
        ("GET", "/api/conversations/{id}"),
        ("DELETE", "/api/conversations/{id}"),
        ("POST", "/api/conversations/{id}/messages"),
        ("GET", "/api/dictionary"),
        ("GET", "/api/documents"),
        ("POST", "/api/documents"),
        ("GET", "/api/guides"),
        ("GET", "/api/laws"),
        ("GET", "/api/laws/{slug}"),
        ("GET", "/api/laws/{slug}/sections"),
        ("GET", "/api/lawyers"),
        ("POST", "/api/payments/create-order"),
        ("POST", "/api/payments/verify"),
        ("POST", "/api/payments/webhook"),
        ("GET", "/api/quizzes"),
        ("GET", "/api/quizzes/{id}"),
        ("POST", "/api/quizzes/{id}/submit"),
        ("GET", "/api/settings"),
        ("PUT", "/api/settings"),
        ("GET", "/api/subscriptions"),
        ("POST", "/api/subscriptions/usage"),
        ("GET", "/api/templates"),
    ];

    let actual = API_ROUTE_SPECS
        .iter()
        .map(|spec| (spec.method, spec.path))
        .collect::<Vec<_>>();

    assert_eq!(actual, expected);
}

#[tokio::test]
async fn health_check_returns_ok() {
    let response = app(ApiState::for_tests())
        .oneshot(
            Request::builder()
                .uri("/healthz")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response_json(response).await;
    assert_eq!(body["status"], "ok");
}

#[tokio::test]
async fn authenticated_conversations_round_trip_in_rust_api() {
    let app = app(ApiState::for_tests());

    let response = app
        .clone()
        .oneshot(json_request(
            Method::POST,
            "/api/conversations",
            json!({ "title": "Rights help", "language": "en" }),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::CREATED);
    let id = response_json(response).await["id"]
        .as_str()
        .expect("conversation id")
        .to_owned();

    let response = app
        .clone()
        .oneshot(json_request(
            Method::POST,
            &format!("/api/conversations/{id}/messages"),
            json!({
                "role": "user",
                "content": "Can police refuse to register an FIR?",
                "updateTitle": true
            }),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::CREATED);

    let response = app
        .oneshot(auth_request(
            Method::GET,
            &format!("/api/conversations/{id}"),
        ))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let body = response_json(response).await;
    assert_eq!(
        body["conversation"]["title"],
        "Can police refuse to register an FIR?"
    );
    assert_eq!(body["messages"].as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn protected_routes_reject_missing_authorization_when_auth_is_enabled() {
    let mut config = ApiConfig::for_tests();
    config.auth_disabled = false;
    let state = ApiState::from_config(config).unwrap();

    let response = app(state)
        .oneshot(
            Request::builder()
                .method(Method::GET)
                .uri("/api/conversations")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn public_catalog_routes_have_default_data() {
    let app = app(ApiState::for_tests());

    let laws = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/laws?q=nyaya")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(laws.status(), StatusCode::OK);
    assert_eq!(
        response_json(laws).await["laws"].as_array().unwrap().len(),
        1
    );

    let guides = app
        .oneshot(
            Request::builder()
                .uri("/api/guides")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(guides.status(), StatusCode::OK);
    assert_eq!(
        response_json(guides).await["guides"]
            .as_array()
            .unwrap()
            .len(),
        1
    );
}

#[tokio::test]
async fn chat_validation_rejects_empty_message_arrays() {
    let response = app(ApiState::for_tests())
        .oneshot(json_request(
            Method::POST,
            "/api/chat",
            json!({ "messages": [] }),
        ))
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

fn auth_request(method: Method, uri: &str) -> Request<Body> {
    Request::builder()
        .method(method)
        .uri(uri)
        .header("x-satyavera-user", "user-1")
        .body(Body::empty())
        .unwrap()
}

fn json_request(method: Method, uri: &str, body: Value) -> Request<Body> {
    Request::builder()
        .method(method)
        .uri(uri)
        .header("x-satyavera-user", "user-1")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(body.to_string()))
        .unwrap()
}

async fn response_json(response: axum::response::Response) -> Value {
    let bytes = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    serde_json::from_slice(&bytes).unwrap()
}
