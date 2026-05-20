use std::{
    collections::{BTreeMap, HashMap},
    env,
    net::{IpAddr, Ipv4Addr, SocketAddr},
    path::PathBuf,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use chrono::Utc;
use satyavera_db::{file_journal::FileJournal, MemoryStore, TransactionalStore};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::error::ApiError;

#[derive(Debug, Clone)]
pub struct ApiConfig {
    pub bind_addr: SocketAddr,
    pub auth_disabled: bool,
    pub firebase_project_id: Option<String>,
    pub laws_data_dir: Option<PathBuf>,
    pub journal_path: Option<PathBuf>,
    pub razorpay_key_id: Option<String>,
    pub razorpay_key_secret: Option<String>,
    pub razorpay_webhook_secret: Option<String>,
}

impl ApiConfig {
    pub fn from_env() -> Self {
        let bind_addr = env::var("SATYAVERA_API_BIND")
            .ok()
            .and_then(|value| value.parse().ok())
            .unwrap_or_else(|| SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 8787));

        let laws_data_dir = env::var("SATYAVERA_LAWS_DATA_DIR")
            .ok()
            .map(PathBuf::from)
            .or_else(|| {
                let default = PathBuf::from("../js/data/laws");
                default.exists().then_some(default)
            });

        Self {
            bind_addr,
            auth_disabled: env::var("SATYAVERA_API_AUTH_DISABLED").ok().as_deref() == Some("1"),
            firebase_project_id: env::var("FIREBASE_PROJECT_ID")
                .ok()
                .or_else(|| env::var("FIREBASE_ADMIN_PROJECT_ID").ok())
                .or_else(|| env::var("NEXT_PUBLIC_FIREBASE_PROJECT_ID").ok()),
            laws_data_dir,
            journal_path: env::var("SATYAVERA_API_JOURNAL_PATH")
                .ok()
                .map(PathBuf::from),
            razorpay_key_id: env::var("RAZORPAY_KEY_ID").ok(),
            razorpay_key_secret: env::var("RAZORPAY_KEY_SECRET").ok(),
            razorpay_webhook_secret: env::var("RAZORPAY_WEBHOOK_SECRET").ok(),
        }
    }

    pub fn for_tests() -> Self {
        Self {
            bind_addr: SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 0),
            auth_disabled: true,
            firebase_project_id: None,
            laws_data_dir: None,
            journal_path: None,
            razorpay_key_id: Some("rzp_test_key".to_owned()),
            razorpay_key_secret: Some("test_secret".to_owned()),
            razorpay_webhook_secret: Some("webhook_secret".to_owned()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ApiTimestamp {
    #[serde(rename = "_seconds")]
    pub seconds: i64,
    #[serde(rename = "_nanoseconds")]
    pub nanoseconds: u32,
}

impl ApiTimestamp {
    pub fn now() -> Self {
        let now = Utc::now();
        Self {
            seconds: now.timestamp(),
            nanoseconds: now.timestamp_subsec_nanos(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Conversation {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub category: Option<String>,
    pub language: String,
    pub created_at: ApiTimestamp,
    pub updated_at: ApiTimestamp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Message {
    pub id: String,
    pub role: String,
    pub content: String,
    pub citations: Vec<String>,
    pub created_at: ApiTimestamp,
}

#[derive(Debug, Default)]
pub struct ApiStore {
    pub conversations: BTreeMap<String, Conversation>,
    pub messages: BTreeMap<String, Vec<Message>>,
    pub documents: BTreeMap<String, Value>,
    pub users: BTreeMap<String, Value>,
    pub subscriptions: BTreeMap<String, Value>,
    pub consultations: BTreeMap<String, Value>,
    pub payment_orders: BTreeMap<String, Value>,
    pub guides: Vec<Value>,
    pub templates: Vec<Value>,
    pub dictionary_entries: Vec<Value>,
    pub lawyers: Vec<Value>,
    pub quizzes: Vec<Value>,
    pub quiz_questions: BTreeMap<String, Vec<Value>>,
    pub laws: LawCatalog,
}

#[derive(Debug, Default)]
pub struct LawCatalog {
    pub summaries: Vec<Value>,
    pub by_slug: BTreeMap<String, Value>,
}

impl LawCatalog {
    pub fn with_sample_data() -> Self {
        let law = json!({
            "id": "the-bharatiya-nyaya-sanhita-2023",
            "slug": "the-bharatiya-nyaya-sanhita-2023",
            "title": "The Bharatiya Nyaya Sanhita, 2023",
            "hindiTitle": "भारतीय न्याय संहिता,2023",
            "actYear": 2023,
            "primaryCategory": "criminal",
            "categories": ["criminal"],
            "sectionCount": 1,
            "sections": [{
                "id": "1",
                "sectionNo": "1",
                "title": "Short title, commencement and application.",
                "content": "This Act may be called the Bharatiya Nyaya Sanhita, 2023.",
                "orderNo": 1
            }]
        });
        let summary = json!({
            "id": "the-bharatiya-nyaya-sanhita-2023",
            "slug": "the-bharatiya-nyaya-sanhita-2023",
            "title": "The Bharatiya Nyaya Sanhita, 2023",
            "hindiTitle": "भारतीय न्याय संहिता,2023",
            "actYear": 2023,
            "primaryCategory": "criminal",
            "categories": ["criminal"],
            "sectionCount": 1
        });
        let mut by_slug = BTreeMap::new();
        by_slug.insert("the-bharatiya-nyaya-sanhita-2023".to_owned(), law);
        Self {
            summaries: vec![summary],
            by_slug,
        }
    }

    pub fn load_from_dir(dir: PathBuf) -> Result<Self, ApiError> {
        if !dir.exists() {
            return Ok(Self::default());
        }

        let mut summaries = Vec::new();
        let mut by_slug = BTreeMap::new();
        for entry in std::fs::read_dir(&dir)? {
            let entry = entry?;
            if !entry.file_type()?.is_dir() {
                continue;
            }
            let category_dir = entry.path();
            let index_path = category_dir.join("_index.json");
            if index_path.exists() {
                let raw = std::fs::read_to_string(&index_path)?;
                let values: Vec<Value> = serde_json::from_str(&raw)?;
                for value in values {
                    if let Some(slug) = value.get("slug").and_then(Value::as_str) {
                        let mut summary = value.clone();
                        if summary.get("id").is_none() {
                            summary["id"] = Value::String(slug.to_owned());
                        }
                        summaries.push(summary);
                    }
                }
            }
            for law_entry in std::fs::read_dir(category_dir)? {
                let law_entry = law_entry?;
                let path = law_entry.path();
                if path.file_name().and_then(|name| name.to_str()) == Some("_index.json") {
                    continue;
                }
                if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
                    continue;
                }
                let raw = std::fs::read_to_string(path)?;
                let mut value: Value = serde_json::from_str(&raw)?;
                if let Some(slug) = value.get("slug").and_then(Value::as_str).map(str::to_owned) {
                    if value.get("id").is_none() {
                        value["id"] = Value::String(slug.clone());
                    }
                    by_slug.entry(slug).or_insert(value);
                }
            }
        }
        summaries.sort_by(|a, b| {
            let left = a.get("title").and_then(Value::as_str).unwrap_or_default();
            let right = b.get("title").and_then(Value::as_str).unwrap_or_default();
            left.cmp(right)
        });
        Ok(Self { summaries, by_slug })
    }
}

#[derive(Clone)]
pub struct ApiState {
    inner: Arc<ApiStateInner>,
}

struct ApiStateInner {
    config: ApiConfig,
    store: Mutex<ApiStore>,
    limiter: Mutex<HashMap<String, RateEntry>>,
    journal: Option<Mutex<TransactionalStore<MemoryStore>>>,
    http: reqwest::Client,
}

#[derive(Debug)]
struct RateEntry {
    count: u32,
    reset_at: Instant,
}

impl ApiState {
    pub fn from_config(config: ApiConfig) -> Result<Self, ApiError> {
        let mut store = ApiStore::default();
        if let Some(dir) = config.laws_data_dir.clone() {
            store.laws = LawCatalog::load_from_dir(dir)?;
        }
        if store.laws.summaries.is_empty() {
            store.laws = LawCatalog::with_sample_data();
        }
        seed_default_catalog(&mut store);

        let journal = config
            .journal_path
            .as_ref()
            .map(FileJournal::open)
            .transpose()
            .map_err(|err| ApiError::internal(err.to_string()))?
            .map(|journal| Mutex::new(TransactionalStore::new(MemoryStore::default(), journal)));

        Ok(Self {
            inner: Arc::new(ApiStateInner {
                config,
                store: Mutex::new(store),
                limiter: Mutex::new(HashMap::new()),
                journal,
                http: reqwest::Client::new(),
            }),
        })
    }

    pub fn for_tests() -> Self {
        Self::from_config(ApiConfig::for_tests()).expect("test state")
    }

    pub fn config(&self) -> &ApiConfig {
        &self.inner.config
    }

    pub fn http(&self) -> reqwest::Client {
        self.inner.http.clone()
    }

    pub fn with_store<R>(&self, f: impl FnOnce(&mut ApiStore) -> R) -> R {
        let mut store = self.inner.store.lock().expect("api store lock poisoned");
        f(&mut store)
    }

    pub fn rate_limit(&self, key: &str, max_per_minute: u32) -> bool {
        let mut limiter = self
            .inner
            .limiter
            .lock()
            .expect("rate limiter lock poisoned");
        let now = Instant::now();
        limiter.retain(|_, entry| entry.reset_at > now);
        let entry = limiter.entry(key.to_owned()).or_insert(RateEntry {
            count: 0,
            reset_at: now + Duration::from_secs(60),
        });
        if entry.count >= max_per_minute {
            return false;
        }
        entry.count += 1;
        true
    }

    pub fn journal_put(&self, key: &str, value: &Value) -> Result<(), ApiError> {
        if let Some(journal) = &self.inner.journal {
            let mut journal = journal.lock().expect("journal lock poisoned");
            journal
                .put(key, &serde_json::to_string(value).map_err(ApiError::from)?)
                .map_err(|err| ApiError::internal(err.to_string()))?;
        }
        Ok(())
    }

    pub fn journal_delete(&self, key: &str) -> Result<(), ApiError> {
        if let Some(journal) = &self.inner.journal {
            let mut journal = journal.lock().expect("journal lock poisoned");
            journal
                .delete(key)
                .map_err(|err| ApiError::internal(err.to_string()))?;
        }
        Ok(())
    }
}

pub fn new_id() -> String {
    Uuid::new_v4().to_string()
}

pub fn timestamp_json() -> Value {
    serde_json::to_value(ApiTimestamp::now()).expect("timestamp serializes")
}

fn seed_default_catalog(store: &mut ApiStore) {
    if store.guides.is_empty() {
        store.guides = vec![json!({
            "id": "arrest-rights",
            "title": "What to do during arrest or detention",
            "titleHi": "गिरफ्तारी या हिरासत के दौरान क्या करें",
            "slug": "arrest-rights",
            "category": "criminal",
            "description": "A practical checklist for asserting basic rights during arrest.",
            "descriptionHi": "गिरफ्तारी के दौरान मूल अधिकारों का उपयोग करने की व्यवहारिक सूची।",
            "icon": "shield",
            "tags": ["arrest", "police", "rights"],
            "readTime": "8 min",
            "rights": [
                "Ask for the grounds of arrest.",
                "Inform a friend or family member.",
                "Request legal aid or an advocate."
            ],
            "rightsHi": [
                "गिरफ्तारी का कारण पूछें।",
                "परिजन या मित्र को सूचना दें।",
                "कानूनी सहायता या अधिवक्ता मांगें।"
            ],
            "steps": [{
                "title": "Stay calm and ask for details",
                "titleHi": "शांत रहें और विवरण पूछें",
                "description": "Note the officer name, police station, time, and stated reason.",
                "descriptionHi": "अधिकारी का नाम, थाना, समय और बताया गया कारण नोट करें।"
            }],
            "relatedLawSections": ["Article 22", "BNSS Section 47"],
            "readCount": 0,
            "featured": true,
            "order": 1
        })];
    }

    if store.templates.is_empty() {
        store.templates = vec![json!({
            "id": "fir",
            "name": "FIR (First Information Report)",
            "nameHi": "प्रथम सूचना रिपोर्ट (FIR)",
            "slug": "fir",
            "category": "criminal",
            "description": "File a police complaint for cognizable offences.",
            "descriptionHi": "संज्ञेय अपराधों के लिए पुलिस शिकायत दर्ज करें।",
            "icon": "shield",
            "format": "PDF / Word",
            "premium": false,
            "downloadCount": 0,
            "content": "To,\nThe Station House Officer,\n{{policeStation}}\n\nSubject: FIR regarding {{offenceType}}\n\n{{description}}",
            "contentHi": "सेवा में,\nथाना प्रभारी,\n{{policeStation}}\n\nविषय: {{offenceType}} के संबंध में प्रथम सूचना रिपोर्ट\n\n{{description}}",
            "order": 1
        })];
    }

    if store.dictionary_entries.is_empty() {
        store.dictionary_entries = vec![
            json!({
                "id": "fir",
                "termEn": "FIR",
                "termHi": "प्रथम सूचना रिपोर्ट",
                "pronunciation": "eff-eye-aar",
                "origin": "English",
                "category": "Criminal Law",
                "definitionEn": "First Information Report prepared by police for a cognizable offence.",
                "definitionHi": "संज्ञेय अपराध की सूचना पर पुलिस द्वारा तैयार की गई प्रथम सूचना रिपोर्ट।",
                "exampleEn": "The victim filed an FIR at the nearest police station.",
                "exampleHi": "पीड़ित ने निकटतम थाने में FIR दर्ज कराई।",
                "relatedTerms": ["Cognizable Offence", "Chargesheet"],
                "relatedSections": ["BNSS Section 173"],
                "source": "SatyaVera default catalog",
                "letter": "F"
            }),
            json!({
                "id": "bail",
                "termEn": "Bail",
                "termHi": "ज़मानत",
                "pronunciation": "bayl",
                "origin": "English",
                "category": "Criminal Law",
                "definitionEn": "Temporary release of an accused person awaiting trial.",
                "definitionHi": "मुकदमे की प्रतीक्षा कर रहे आरोपी व्यक्ति की अस्थायी रिहाई।",
                "exampleEn": "The accused was granted bail by the Sessions Court.",
                "exampleHi": "आरोपी को सत्र न्यायालय ने ज़मानत दी।",
                "relatedTerms": ["Surety", "Bond"],
                "relatedSections": ["BNSS Sections 478-484"],
                "source": "SatyaVera default catalog",
                "letter": "B"
            }),
        ];
    }

    if store.lawyers.is_empty() {
        store.lawyers = vec![json!({
            "id": "adv-aanya-sharma",
            "name": "Adv. Aanya Sharma",
            "verified": true,
            "rating": 4.8,
            "reviewCount": 124,
            "experience": 11,
            "location": "Saket, New Delhi",
            "city": "Delhi",
            "state": "Delhi",
            "practiceAreas": ["criminal", "family", "consumer"],
            "languages": ["English", "Hindi"],
            "fee": "Rs. 1500 consultation",
            "feeAmount": 1500,
            "availability": "Today",
            "courts": ["Delhi High Court", "District Courts"],
            "description": "Criminal and family law advocate focused on practical citizen guidance.",
            "descriptionHi": "नागरिकों के लिए व्यवहारिक मार्गदर्शन देने वाली आपराधिक और पारिवारिक कानून अधिवक्ता।"
        })];
    }

    if store.quizzes.is_empty() {
        store.quizzes = vec![json!({
            "id": "fundamental-rights",
            "title": "Know Your Fundamental Rights",
            "titleHi": "अपने मौलिक अधिकारों को जानें",
            "category": "constitutional",
            "difficulty": "Beginner",
            "questionCount": 1,
            "timeMinutes": 3,
            "completedCount": 0,
            "icon": "shield",
            "order": 1
        })];
        store.quiz_questions.insert(
            "fundamental-rights".to_owned(),
            vec![json!({
                "id": "q1",
                "question": "Which Article protects life and personal liberty?",
                "questionHi": "जीवन और व्यक्तिगत स्वतंत्रता की रक्षा कौन सा अनुच्छेद करता है?",
                "options": ["Article 14", "Article 19", "Article 21", "Article 25"],
                "optionsHi": ["अनुच्छेद 14", "अनुच्छेद 19", "अनुच्छेद 21", "अनुच्छेद 25"],
                "correctIndex": 2,
                "explanation": "Article 21 protects life and personal liberty.",
                "explanationHi": "अनुच्छेद 21 जीवन और व्यक्तिगत स्वतंत्रता की रक्षा करता है।",
                "lawReference": "Article 21, Constitution of India",
                "order": 1
            })],
        );
    }
}
