use std::collections::HashMap;

use axum::http::HeaderMap;
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::Deserialize;

use crate::{error::ApiError, state::ApiState};

#[derive(Debug, Clone, Deserialize)]
struct FirebaseClaims {
    aud: String,
    iss: String,
    sub: String,
    user_id: Option<String>,
}

pub async fn require_user(headers: &HeaderMap, state: &ApiState) -> Result<String, ApiError> {
    if state.config().auth_disabled {
        return Ok(headers
            .get("x-satyavera-user")
            .and_then(|value| value.to_str().ok())
            .filter(|value| !value.is_empty())
            .unwrap_or("dev-user")
            .to_owned());
    }

    let token = headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .ok_or_else(|| ApiError::unauthorized("Unauthorized"))?;

    let project_id = state
        .config()
        .firebase_project_id
        .as_deref()
        .ok_or_else(|| ApiError::service_unavailable("Firebase auth verifier is not configured"))?;

    verify_firebase_token(token, project_id, state).await
}

async fn verify_firebase_token(
    token: &str,
    project_id: &str,
    state: &ApiState,
) -> Result<String, ApiError> {
    let header = decode_header(token).map_err(|_| ApiError::unauthorized("Invalid token"))?;
    if header.alg != Algorithm::RS256 {
        return Err(ApiError::unauthorized("Invalid token algorithm"));
    }
    let kid = header
        .kid
        .ok_or_else(|| ApiError::unauthorized("Token missing key id"))?;

    let certs: HashMap<String, String> = state
        .http()
        .get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com")
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;
    let cert = certs
        .get(&kid)
        .ok_or_else(|| ApiError::unauthorized("Unknown token key id"))?;
    let key = DecodingKey::from_rsa_pem(cert.as_bytes())
        .map_err(|_| ApiError::unauthorized("Invalid token certificate"))?;

    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[project_id]);
    validation.set_issuer(&[format!("https://securetoken.google.com/{project_id}")]);

    let data = decode::<FirebaseClaims>(token, &key, &validation)
        .map_err(|_| ApiError::unauthorized("Invalid token"))?;

    if data.claims.aud != project_id
        || data.claims.iss != format!("https://securetoken.google.com/{project_id}")
    {
        return Err(ApiError::unauthorized("Invalid token claims"));
    }
    Ok(data.claims.user_id.unwrap_or(data.claims.sub))
}
