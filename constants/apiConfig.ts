const API_BASE_URL = "https://d48d4ec9540b.ngrok.app/api"; // Replace with your server's base URL

const apiEndpoints = {
  recipes: `${API_BASE_URL}/recipes`,
  scale: `${API_BASE_URL}/scale`,
  processImage: `${API_BASE_URL}/process-image`,
};

export default apiEndpoints;
