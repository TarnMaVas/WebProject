# SnippetSearch

**SnippetSearch** is a web-based platform designed for exploring, filtering, and engaging with code snippets. It provides a user-friendly interface for searching content by tags or keywords, and includes features for user authentication and interaction with shared code.

---

## Features

- User registration and login  
- Secure authentication with Firebase  
- Search functionality with tag-based filtering  
- Support for commenting and feedback on snippets  
- Dynamic content rendering based on user state  
- Responsive interface styled with CSS and component-based layout  

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)  
- Firebase project with Authentication and Storage enabled  
- Google Cloud SDK (optional, for advanced configuration)  

---

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/TarnMaVas/WebProject.git
cd WebProject
```

2. **Install dependencies**

```bash
npm install \
  react@^19.1.0 \
  react-dom@^19.1.0 \
  react-scripts@^5.0.1 \
  firebase@^11.6.1 \
  react-select@^5.10.1 \
  @testing-library/react@^16.2.0 \
  @testing-library/jest-dom@^6.6.3 \
  @testing-library/user-event@^13.5.0 \
  @testing-library/dom@^10.4.0 \
  web-vitals@^2.1.4

npm install
```

3. **Set up Firebase**

Configure `src/firebase/config.js` with your Firebase project's credentials:

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
```

### CORS Configuration

To enable secure access to Firebase Storage resources, configure CORS using the [Google Cloud CLI](https://cloud.google.com/sdk) and the provided cors.json file:

```bash
gcloud init
gcloud storage buckets update gs://<your-bucket-name> --cors-file=cors.json
```

## Development

To start the application locally:

```bash
npm start
```

## License

This project is licensed under the MIT License.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
