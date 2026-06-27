use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct Paper {
    id: String,
    title: String,
    authors: Vec<String>,
    abstract_text: String,
    year: u32,
    citations: u32,
    url: String,
    open_access: bool,
    pdf_url: Option<String>,
}

#[derive(Deserialize)]
struct SearchRequest {
    query: String,
    year_start: Option<u32>,
    year_end: Option<u32>,
    open_access_only: Option<bool>,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Free academic search".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn search_papers(Json(req): Json<SearchRequest>) -> impl IntoResponse {
    let papers = vec![
        Paper {
            id: "1".to_string(),
            title: "Deep Learning for Natural Language Processing".to_string(),
            authors: vec!["Zhang et al.".to_string()],
            abstract_text: "This survey reviews recent advances in deep learning for NLP tasks...".to_string(),
            year: 2023,
            citations: 456,
            url: "https://api.semanticscholar.org/paper/1".to_string(),
            open_access: true,
            pdf_url: Some("https://arxiv.org/pdf/2301.00001".to_string()),
        },
        Paper {
            id: "2".to_string(),
            title: "Transformers in Computer Vision".to_string(),
            authors: vec!["Li et al.".to_string()],
            abstract_text: "Vision transformers have achieved remarkable results...".to_string(),
            year: 2024,
            citations: 234,
            url: "https://api.semanticscholar.org/paper/2".to_string(),
            open_access: true,
            pdf_url: Some("https://arxiv.org/pdf/2401.00001".to_string()),
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(papers),
        error: None,
    })
}

async fn get_paper_details(Json(req): Json<serde_json::Value>) -> impl IntoResponse {
    let paper_id = req.get("paper_id").and_then(|v| v.as_str()).unwrap_or("1");
    
    let details = serde_json::json!({
        "id": paper_id,
        "title": "Detailed Paper View",
        "full_abstract": "Complete abstract text would appear here with all the details about the research methodology, findings, and conclusions...",
        "references_count": 45,
        "citations_count": 234,
        "tldr": "This paper presents a novel approach using transformers for improved performance."
    });

    Json(ApiResponse {
        success: true,
        data: Some(details),
        error: None,
    })
}

async fn get_recommendations(Json req): Json<serde_json::Value> {
    let recommendations = vec![
        serde_json::json!({
            "title": "Recommended Paper 1",
            "reason": "Based on citations and topic similarity",
            "relevance": 0.92
        }),
        serde_json::json!({
            "title": "Recommended Paper 2",
            "reason": "Frequently co-cited with your results",
            "relevance": 0.87
        }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(recommendations),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_papers": 234567890,
            "total_citations": 1234567890,
            "open_access_papers": 89012345,
            "authors": 23456789
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/search", post(search_papers))
        .route("/api/paper", post(get_paper_details))
        .route("/api/recommendations", post(get_recommendations))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Free academic search backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
