// Ribio Seller Authentication System
// ملف مركزي لإدارة المصادقة والتحقق من البائعين

class SellerAuth {
    constructor() {
        this.STORAGE_KEY = 'sellerData';
        this.REMEMBER_KEY = 'rememberSeller';
        this.ROLE_KEY = 'userRole';
    }

    // حفظ بيانات البائع
    saveSellerData(sellerData) {
        try {
            const data = {
                email: sellerData.email,
                name: sellerData.name,
                storeId: sellerData.storeId,
                loginTime: new Date().toISOString(),
                isLoggedIn: true,
                ...sellerData
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            localStorage.setItem(this.ROLE_KEY, 'seller');
            return true;
        } catch (e) {
            console.error('خطأ في حفظ بيانات البائع:', e);
            return false;
        }
    }

    // الحصول على بيانات البائع
    getSellerData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('خطأ في قراءة بيانات البائع:', e);
            return null;
        }
    }

    // التحقق من تسجيل الدخول
    isLoggedIn() {
        const sellerData = this.getSellerData();
        return sellerData && sellerData.isLoggedIn === true;
    }

    // حفظ تذكر المستخدم
    rememberSeller(email) {
        try {
            localStorage.setItem(this.REMEMBER_KEY, email);
        } catch (e) {
            console.error('خطأ في حفظ تذكر المستخدم:', e);
        }
    }

    // الحصول على البريد الإلكتروني المذكور
    getRememberedEmail() {
        return localStorage.getItem(this.REMEMBER_KEY) || '';
    }

    // حذف البريد الإلكتروني المذكور
    forgetSeller() {
        try {
            localStorage.removeItem(this.REMEMBER_KEY);
        } catch (e) {
            console.error('خطأ في حذف تذكر المستخدم:', e);
        }
    }

    // تسجيل الخروج
    logout() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.ROLE_KEY);
            return true;
        } catch (e) {
            console.error('خطأ في تسجيل الخروج:', e);
            return false;
        }
    }

    // الحصول على معلومات البائع
    getSellerName() {
        const data = this.getSellerData();
        return data ? data.name : 'بائع';
    }

    // الحصول على البريد الإلكتروني للبائع
    getSellerEmail() {
        const data = this.getSellerData();
        return data ? data.email : '';
    }

    // الحصول على معرف المتجر
    getStoreId() {
        const data = this.getSellerData();
        return data ? data.storeId : '';
    }

    // تحديث بيانات البائع
    updateSellerData(updates) {
        const currentData = this.getSellerData();
        if (currentData) {
            const updatedData = { ...currentData, ...updates };
            return this.saveSellerData(updatedData);
        }
        return false;
    }

    // قياس مدة الجلسة (بالدقائق)
    getSessionDuration() {
        const data = this.getSellerData();
        if (!data || !data.loginTime) return 0;
        
        const loginTime = new Date(data.loginTime);
        const currentTime = new Date();
        const duration = (currentTime - loginTime) / (1000 * 60); // تحويل إلى دقائق
        return Math.floor(duration);
    }

    // التحقق من انتهاء صلاحية الجلسة (24 ساعة)
    isSessionExpired() {
        const duration = this.getSessionDuration();
        const maxDuration = 24 * 60; // 24 ساعة
        return duration > maxDuration;
    }

    // تحديث وقت النشاط الأخير
    updateLastActivity() {
        const data = this.getSellerData();
        if (data) {
            data.lastActivity = new Date().toISOString();
            this.saveSellerData(data);
        }
    }
}

// إنشاء نسخة عامة من فئة المصادقة
const sellerAuth = new SellerAuth();

// دالة للتحقق من المصادقة قبل فتح الصفحات المحمية
function requireLogin() {
    if (!sellerAuth.isLoggedIn()) {
        window.location.href = 'seller-login.html';
        return false;
    }
    
    // التحقق من انتهاء صلاحية الجلسة
    if (sellerAuth.isSessionExpired()) {
        sellerAuth.logout();
        alert('انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = 'seller-login.html';
        return false;
    }
    
    return true;
}

// تحديث نشاط المستخدم عند التفاعل مع الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحديث النشاط عند حركة الفأرة
    document.addEventListener('mousemove', function() {
        sellerAuth.updateLastActivity();
    }, { passive: true });
    
    // تحديث النشاط عند الضغط على لوحة المفاتيح
    document.addEventListener('keypress', function() {
        sellerAuth.updateLastActivity();
    }, { passive: true });
});

// معالجة تسجيل الخروج التلقائي عند إغلاق الصفحة
window.addEventListener('beforeunload', function() {
    // يمكن حفظ بيانات الجلسة هنا إذا لزم الأمر
});

// تسجيل أن النظام جاهز
console.log('✓ نظام المصادقة محمّل بنجاح');
console.log('✓ الكائن sellerAuth متاح');
