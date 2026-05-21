use hmac::{Hmac, Mac};
use serde_json::{json, Value};
use sha2::Sha256;

use crate::{error::ApiError, state::ApiState};

type HmacSha256 = Hmac<Sha256>;

pub const PLAN_CITIZEN_PREMIUM: &str = "CITIZEN_PREMIUM";
pub const PLAN_LAWYER_PRO: &str = "LAWYER_PRO";

pub fn plan_amount(plan: &str, billing: &str) -> Option<i64> {
    match (plan, billing) {
        (PLAN_CITIZEN_PREMIUM, "monthly") => Some(9_900),
        (PLAN_CITIZEN_PREMIUM, "yearly") => Some(99_900),
        (PLAN_LAWYER_PRO, "monthly") => Some(49_900),
        (PLAN_LAWYER_PRO, "yearly") => Some(499_900),
        _ => None,
    }
}

pub async fn create_order(
    state: &ApiState,
    user_id: &str,
    plan: &str,
    billing: &str,
) -> Result<Value, ApiError> {
    let amount = plan_amount(plan, billing)
        .ok_or_else(|| ApiError::bad_request("Invalid plan or billing cycle"))?;
    let key_id = state
        .config()
        .razorpay_key_id
        .as_deref()
        .ok_or_else(|| ApiError::service_unavailable("Payment service is not configured"))?
        .to_owned();
    let key_secret = state
        .config()
        .razorpay_key_secret
        .as_deref()
        .ok_or_else(|| ApiError::service_unavailable("Payment service is not configured"))?
        .to_owned();

    let payload = json!({
        "amount": amount,
        "currency": "INR",
        "receipt": format!("{user_id}_{plan}_{}", chrono::Utc::now().timestamp_millis()),
        "notes": {
            "userId": user_id,
            "plan": plan,
            "billing": billing
        }
    });

    let response = state
        .http()
        .post("https://api.razorpay.com/v1/orders")
        .basic_auth(&key_id, Some(&key_secret))
        .json(&payload)
        .send()
        .await;

    let order = match response {
        Ok(response) if response.status().is_success() => response.json::<Value>().await?,
        _ if state.config().auth_disabled => json!({
            "id": format!("order_{}", uuid::Uuid::new_v4().simple()),
            "amount": amount,
            "currency": "INR",
            "notes": payload["notes"].clone()
        }),
        Ok(response) => {
            return Err(ApiError::service_unavailable(format!(
                "Razorpay order creation failed with status {}",
                response.status()
            )));
        }
        Err(error) => return Err(ApiError::service_unavailable(error.to_string())),
    };

    let order_id = order
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| ApiError::service_unavailable("Razorpay order response missing id"))?;
    state.with_store(|store| {
        store
            .payment_orders
            .insert(order_id.to_owned(), order.clone());
    });
    state.journal_put(&format!("paymentOrders/{order_id}"), &order)?;

    Ok(json!({
        "orderId": order_id,
        "amount": order.get("amount").cloned().unwrap_or(json!(amount)),
        "currency": order.get("currency").cloned().unwrap_or(json!("INR")),
        "keyId": key_id
    }))
}

pub fn verify_payment_signature(
    order_id: &str,
    payment_id: &str,
    signature: &str,
    secret: &str,
) -> bool {
    let Ok(mut mac) = HmacSha256::new_from_slice(secret.as_bytes()) else {
        return false;
    };
    mac.update(format!("{order_id}|{payment_id}").as_bytes());
    let expected = hex::encode(mac.finalize().into_bytes());
    constant_time_eq(expected.as_bytes(), signature.as_bytes())
}

pub fn verify_webhook_signature(raw_body: &str, signature: &str, secret: &str) -> bool {
    let Ok(mut mac) = HmacSha256::new_from_slice(secret.as_bytes()) else {
        return false;
    };
    mac.update(raw_body.as_bytes());
    let expected = hex::encode(mac.finalize().into_bytes());
    constant_time_eq(expected.as_bytes(), signature.as_bytes())
}

fn constant_time_eq(left: &[u8], right: &[u8]) -> bool {
    if left.len() != right.len() {
        return false;
    }
    left.iter()
        .zip(right.iter())
        .fold(0u8, |acc, (a, b)| acc | (a ^ b))
        == 0
}
