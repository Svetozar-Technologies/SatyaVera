pub mod ai;
pub mod auth;
pub mod error;
pub mod handlers;
pub mod payments;
pub mod state;

use axum::{
    routing::{get, patch, post},
    Router,
};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ApiRouteSpec {
    pub method: &'static str,
    pub path: &'static str,
}

pub const API_ROUTE_SPECS: &[ApiRouteSpec] = &[
    ApiRouteSpec {
        method: "POST",
        path: "/api/chat",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/consultations",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/consultations",
    },
    ApiRouteSpec {
        method: "PATCH",
        path: "/api/consultations/{id}",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/conversations",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/conversations",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/conversations/{id}",
    },
    ApiRouteSpec {
        method: "DELETE",
        path: "/api/conversations/{id}",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/conversations/{id}/messages",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/dictionary",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/documents",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/documents",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/guides",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/laws",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/laws/{slug}",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/laws/{slug}/sections",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/lawyers",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/payments/create-order",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/payments/verify",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/payments/webhook",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/quizzes",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/quizzes/{id}",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/quizzes/{id}/submit",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/settings",
    },
    ApiRouteSpec {
        method: "PUT",
        path: "/api/settings",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/subscriptions",
    },
    ApiRouteSpec {
        method: "POST",
        path: "/api/subscriptions/usage",
    },
    ApiRouteSpec {
        method: "GET",
        path: "/api/templates",
    },
];

pub fn app(state: state::ApiState) -> Router {
    Router::new()
        .route("/healthz", get(handlers::healthz))
        .route("/api/chat", post(handlers::post_chat))
        .route(
            "/api/consultations",
            get(handlers::get_consultations).post(handlers::post_consultation),
        )
        .route(
            "/api/consultations/:id",
            patch(handlers::patch_consultation),
        )
        .route(
            "/api/conversations",
            get(handlers::get_conversations).post(handlers::post_conversation),
        )
        .route(
            "/api/conversations/:id",
            get(handlers::get_conversation).delete(handlers::delete_conversation),
        )
        .route(
            "/api/conversations/:id/messages",
            post(handlers::post_conversation_message),
        )
        .route("/api/dictionary", get(handlers::get_dictionary))
        .route(
            "/api/documents",
            get(handlers::get_documents).post(handlers::post_document),
        )
        .route("/api/guides", get(handlers::get_guides))
        .route("/api/laws", get(handlers::get_laws))
        .route("/api/laws/:slug", get(handlers::get_law))
        .route("/api/laws/:slug/sections", get(handlers::get_law_sections))
        .route("/api/lawyers", get(handlers::get_lawyers))
        .route(
            "/api/payments/create-order",
            post(handlers::post_payment_order),
        )
        .route("/api/payments/verify", post(handlers::post_payment_verify))
        .route(
            "/api/payments/webhook",
            post(handlers::post_payment_webhook),
        )
        .route("/api/quizzes", get(handlers::get_quizzes))
        .route("/api/quizzes/:id", get(handlers::get_quiz))
        .route("/api/quizzes/:id/submit", post(handlers::post_quiz_submit))
        .route(
            "/api/settings",
            get(handlers::get_settings).put(handlers::put_settings),
        )
        .route("/api/subscriptions", get(handlers::get_subscription))
        .route(
            "/api/subscriptions/usage",
            post(handlers::post_subscription_usage),
        )
        .route("/api/templates", get(handlers::get_templates))
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
}

pub use state::{ApiConfig, ApiState};
