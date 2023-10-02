import React from 'react';
import ReacDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './firebaseConfig';

//Components
import LoginPage from './pages/login/loginPage.js';
import SignupPage from './pages/signup/signupPage.js';
import NotFoundPage from './pages/notFound/notFoundPage.js';
import TodoPage from './pages/todoPage.js';
import PrioritiesPage from './pages/prioritiesPage';
import ReviewPage from './pages/reviewPage';
import TimelinePage from './pages/timeline/timelinePage';
import { AuthProvider } from './contexts/AuthContext';
import { DBProvider } from './contexts/DBContext';
import CapturePage from './pages/capturePage';

const App = () => {
    return (
        <AuthProvider>
            <DBProvider>
                <BrowserRouter>
                    <Routes>
                        {/* <Route path="/" element={<PrioritiesPage />} /> */}
                        <Route path="/" element={<CapturePage />} />
                        <Route path="/capture" element={<CapturePage />} />
                        <Route path="/priorities" element={<PrioritiesPage />} />
                        <Route path="/todo" element={<TodoPage />} />
                        <Route path="/review" element={<ReviewPage />} />
                        <Route path="/timeline" element={<TimelinePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes >
                </BrowserRouter >
            </DBProvider>
        </AuthProvider>
    );
};

ReacDOM.render(
    <App />, document.getElementById("page_root")
);