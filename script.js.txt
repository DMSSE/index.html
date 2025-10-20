// ===== Navigation Smooth Scrolling =====
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== Gemini AI API Integration =====
const GEMINI_API_KEY = 'AQ.Ab8RN6IigntmyQpL6DQpk8SS8-cNz-KDgM-2m6Y8GzZ7JvgIHg';

// دالة للتواصل مع Gemini API
async function askGemini(question) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: question }] }]
                })
            }
        );
        const data = await response.json();
        const answer =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "لا توجد إجابة من الذكاء الاصطناعي حالياً.";
        return answer;
    } catch (e) {
        return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي!";
    }
}

// دالة إرسال الرسالة عبر واجهة المستخدم والشات بوت
async function sendMessage() {
    const input = document.getElementById('userInput');
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    addMessage("...جارٍ البحث عن الإجابة بواسطة الذكاء الاصطناعي...", 'bot');
    // جلب الإجابة من Gemini API
    const answer = await askGemini(question);
    // مسح رسائل التحميل
    const messagesContainer = document.getElementById('chatMessages');
    const loadingMsg = messagesContainer.querySelector('.bot-message:last-child');
    if (loadingMsg && loadingMsg.innerHTML.includes("...جارٍ البحث")) {
        loadingMsg.remove();
    }
    addMessage(answer, 'bot');
}

// دالة لإضافة رسالة إلى مربع المحادثة
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const welcomeMsg = messagesContainer.querySelector('.welcome-message');
    if (welcomeMsg && sender === 'user') {
        welcomeMsg.remove();
    }
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function askQuestion(question) {
    document.getElementById('userInput').value = question;
    sendMessage();
}

// إضافة حدث الضغط على Enter لإرسال السؤال
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('userInput');
    if (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // تأثيرات التمرير للأقسام
    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // تمرير سلس لروابط التنقل
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection
