"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db, auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const courses = [

    { id: "fullstack", name: "Full Stack", emoji: "💻" },
    { id: "aptitude", name: "Quantitative Aptitude", emoji: "🔢" },
    { id: "reasoning", name: "Logical Reasoning", emoji: "🧠" },
    { id: "ai", name: "Artificial Intelligence", emoji: "🤖" },
    { id: "commerce", name: "Commerce", emoji: "📈" },
    { id: "ca", name: "Chartered Accountant", emoji: "📜" },
    { id: "pharma", name: "Basics of Pharma", emoji: "💊" },
];

function HomeContent() {
    const searchParams = useSearchParams();
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [regMethod, setRegMethod] = useState<"whatsapp" | "gmail" | null>(null);

    useEffect(() => {
        const name = searchParams.get('name');
        const phone = searchParams.get('phone');
        const courseId = searchParams.get('course');

        if (name || phone) {
            setFormData(prev => ({
                name: name || prev.name,
                phone: phone || prev.phone
            }));
        }

        if (courseId) {
            const course = courses.find(c => c.id === courseId);
            if (course) setSelectedCourse(course.name);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "registrations"), {
                ...formData,
                course: selectedCourse,
                timestamp: serverTimestamp(),
            });
            setRegMethod("whatsapp");
            setSubmitted(true);
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!selectedCourse) return;
        console.log("Firebase Config Check:", {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        });
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            await addDoc(collection(db, "registrations"), {
                name: user.displayName || "Google User",
                email: user.email,
                phone: user.phoneNumber || "N/A",
                course: selectedCourse,
                method: "google",
                timestamp: serverTimestamp(),
            });
            setRegMethod("gmail");
            setSubmitted(true);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            alert("Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="success-screen">
                <div className="gpay-container">
                    <div className="tick-wrapper">
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <h1 className="success-title"><span className="highlight" style={{ textTransform: 'uppercase' }}>GKL ACADEMY</span></h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: '600' }}>REGISTRATION SUCCESSFUL!</p>
                    <div className="success-details">
                        <p className="success-name">{formData.name || "Student"}</p>
                        <p className="success-info">You've successfully claimed: <br /><strong>{selectedCourse}</strong></p>
                    </div>
                    <p className="success-note">
                        We will send a link in **{regMethod === 'gmail' ? 'Gmail' : 'WhatsApp'}** shortly with the session details. 🚀
                    </p>
                    <button onClick={() => window.location.href = '/'} className="btn-secondary" style={{ marginTop: '2rem', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px' }}>
                        Done
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="premium-bg"></div>

            <header className="top-header">
                <div className="brand">
                    <span className="scholarship-icon">🎓</span>
                    <span>gkl<span className="highlight">academy</span></span>
                </div>
            </header>

            <div className="main-container">
                <header>
                    <h1 className="hero-title">Master Your <span className="highlight">Career</span> for Free</h1>
                    <p className="subtitle">
                        This is a 2-hour session with top university professors. By the end of this session,
                        you will have complete clarity on your next steps toward professional success. 🚀
                    </p>
                </header>

                {/* Stats Section */}
                <div className="stats-grid">
                    <div className="stat-box">
                        <div className="stat-icon">👥</div>
                        <div className="stat-text">15k+ Students<br />Registered</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-text">Certified by Top<br />Tech Giants</div>
                    </div>
                </div>

                {!selectedCourse ? (
                    <div>
                        <div className="certificate-notice">
                            ✨ We provide a free certificate that is valid for your career!
                        </div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Choose Your Path:</h2>
                        <div className="course-list">
                            {courses.map((course) => (
                                <button
                                    key={course.id}
                                    className="course-btn"
                                    onClick={() => setSelectedCourse(course.name)}
                                >
                                    <div className="emoji">{course.emoji}</div>
                                    <span>{course.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>claiming course: <span className="highlight">{selectedCourse}</span></h2>
                        <button
                            className="btn-secondary"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.9rem',
                                marginBottom: '2rem'
                            }}
                            onClick={() => setSelectedCourse(null)}
                        >
                            change selection
                        </button>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={loading || submitted}
                                />
                            </div>
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    disabled={loading || submitted}
                                />
                            </div>

                            {!submitted ? (
                                <button className="btn-primary" disabled={loading}>
                                    {loading ? "REGISTERING..." : "REGISTER NOW 🔥"}
                                </button>
                            ) : null}

                            {!submitted && (
                                <div className="social-login">
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Quickly register with</p>
                                    <button
                                        type="button"
                                        className="social-btn google-btn"
                                        onClick={handleGoogleSignIn}
                                        disabled={loading || submitted}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            width: '100%',
                                            padding: '0.8rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            background: 'white',
                                            color: '#1e293b',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                <div className="contact-reminder">
                    📢 Please ensure you register with a valid mobile number or Gmail address,
                    as we will be sending the link to join the masterclass through these channels.
                </div>

                <footer style={{ marginTop: '5rem', color: '#94a3b8', fontSize: '0.95rem', fontWeight: '500' }}>
                    <p>Share gklacademy with your friends to grow together! 💎✨</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        &copy; 2025 gklacademy. All rights reserved.
                    </p>
                </footer>
            </div>
        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="loading-screen">Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}
