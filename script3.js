// ========== إعدادات API ==========
const GEMINI_API_KEY = 'AQ.Ab8RN6IigntmyQpL6DQpk8SS8-cNz-KDgM-2m6Y8GzZ7JvgIHg';

// ========== دالة طلب الذكاء الاصطناعي (Gemini) ==========
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

// ========== قراءة النص صوتيًا ==========
function speakAnswer(text, lang = "ar-EG") {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.cancel(); // إلغاء أي صوت سابق
        window.speechSynthesis.speak(utterance);
    }
}

// ========== معالجة الروابط في الرد ==========
function linkify(text) {
    // دعم الروابط للمصادر: https://example.com
    return text.replace(
        /((https?:\/\/[^\s<>"]+))/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
}

// ========== معالجة الصور في الرد ==========
function imageify(text) {
    // دعم الروابط المنتهية بامتداد صورة jpg/png/jpeg/gif/webp
    return text.replace(
        /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/g,
        '<img src="$1" alt="صورة من الذكاء الاصطناعي" style="max-width:300px;margin:10px 0;display:block;">'
    );
}

// ========== إرسال رسالة واستهلاك Gemini ==========
async function sendMessage() {
    const input = document.getElementById('userInput');
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    addMessage("...جارٍ البحث عن الإجابة بواسطة الذكاء الاصطناعي...", 'bot');

    // معالجة الذكاء الاصطناعي
    const answerText = await askGemini(question);

    // تجهيز الرد (صور + روابط)
    let answerHtml = linkify(imageify(answerText));

    // إزالة رسالة التحميل
    const messagesContainer = document.getElementById('chatMessages');
    const loadingMsg = messagesContainer.querySelector('.bot-message:last-child');
    if (loadingMsg && loadingMsg.innerHTML.includes("...جارٍ البحث")) {
        loadingMsg.remove();
    }
    addMessage(answerHtml + voiceBtnHtml(answerText), 'bot');
}

// ========== زر الصوت ==========
function voiceBtnHtml(text) {
    return `
        <button class="voice-btn" onclick="speakAnswer(\`${text.replace(/[`\\]/g, '')}\`)">
            <i class="fas fa-volume-up"></i> اسمع الرد
        </button>
    `;
}

// ========== إضافة رسالة إلى مربع المحادثة ==========
function addMessage(html, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const welcomeMsg = messagesContainer.querySelector('.welcome-message');
    if (welcomeMsg && sender === 'user') {
        welcomeMsg.remove();
    }
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = html;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ========== سؤال سريع جاهز ==========
function askQuestion(question) {
    document.getElementById('userInput').value = question;
    sendMessage();
}

// ========== تفعيل إرسال الرسالة بالضغط على Enter ==========
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('userInput');
    if (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') sendMessage();
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

    // تمرير سلس
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
});

// ===== تحديث نافذة النافبار عند التمرير =====
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(26, 26, 46, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
    }
});

// ====== تعيين الدالة الصوتية على مستوى عالمي ======
window.speakAnswer = speakAnswer;

console.log('🚀 Gemini AI chatbot with صوت وصور وروابط جاهز!');
