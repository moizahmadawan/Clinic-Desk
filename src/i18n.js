// Urdu / English mode. Sirf wo screens use karti hain jin mein toggle hai (Home/Login English hi rehte hain).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'langMode';

const STR = {
  en: {
    // fields
    f_patientName: 'Patient Name',
    f_father: 'Father/Husband Name',
    f_age: 'Age',
    f_gender: 'Gender',
    f_marital: 'Marital Status',
    f_visit: 'Visit Number',
    f_phone: 'Phone',
    f_email: 'Email',
    f_bp: 'Blood Pressure',
    f_sugar: 'Sugar Level',
    f_city: 'City',
    f_country: 'Country',
    f_address: 'Present Address',
    f_symptoms: 'Symptoms',
    f_date: 'Date',
    optional: '(optional)',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    single: 'Single',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
    cancel: 'Cancel',
    error: 'Error',

    // registration
    reg_visit_auto: 'Visit number is added automatically',
    reg_visit_first: '1 (first visit)',
    reg_btn: 'Register Patient',
    reg_missingTitle: 'Incomplete information',
    reg_missingMsg: 'These fields are required:',
    reg_success: 'Patient registered successfully!',
    reg_fail: 'Registration failed. Check your internet and Firestore rules.',
    dup_title: 'Already registered',
    dup_msgNew:
      '"{name}" is already registered (current visit: {visit}).\n\nOpen the patient and save a recommendation. It will automatically become visit {next}.',
    dup_msgSame:
      '"{name}" is already registered (current visit: {visit}).\n\nOpen the patient to add or change the recommendation for today (visit {visit}).',
    dup_open: 'Open patient',

    // list
    l_search: 'Search by name or phone...',
    l_total: '{title}: {n}',
    h_patients: 'Registered Patients',
    h_prescriptions: 'Prescriptions',
    h_medicine: 'Medicine',
    l_view: 'View',
    l_edit: 'Edit',
    l_delete: 'Delete',
    l_reco: 'Recommendation',
    l_open: 'Open / Print',
    l_none: 'No patient found.',
    l_sdw: 'S/D/W of',
    l_agePhone: 'Age: {age}  •  Phone: {phone}',
    l_meds: '{n} medicine(s) recommended',
    l_visit: 'Visit: {n}',
    l_delTitle: 'Delete Patient',
    l_delMsg: 'Delete the record of "{name}"?',
    l_loadErr: 'Could not load patients. Check your internet.',
    l_delErr: 'Could not delete.',

    // details / edit
    d_registered: 'Registered',
    d_meds: 'Recommended Medicines',
    d_edit: 'Edit Patient',
    d_reco: 'Recommend Medicine',
    d_notFound: 'Patient record not found.',
    d_loadErr: 'Could not load the patient.',
    e_save: 'Save Changes',
    e_saved: 'Changes saved!',
    e_saveErr: 'Could not save changes.',
    e_nameReq: 'Please enter the patient name.',

    // recommend
    r_meds: 'Medicines (tap to select)',
    r_customPh: 'Enter new medicine',
    add: 'Add',
    r_selected: 'Selected ({n})',
    r_none: 'No medicine selected yet.',
    remove: 'Remove',
    r_insPh: 'How to take (instructions)',
    r_tapHint: 'Tap to write instructions',
    r_save: 'Save Recommendation',
    r_print: 'Print Prescription',
    r_share: 'Share PDF',
    r_saved: '✅ Saved. This is visit #{n}.',
    r_saveFail: '❌ Failed to save recommendation.',
    r_manageMeds: 'Manage Medicines',
    r_manageIns: 'Manage Suggestions',
    r_lastRec: 'Last recommendation: {time}',
    r_visitNew: 'Visit #{cur} done. Saving now will create visit #{n}.',
    r_visitSame: 'Current visit: #{n}',
    r_printErr: 'Could not print.',
    r_pdfErr: 'Could not create the PDF.',
    r_insTitle: 'Suggestions (how to take)',
    r_editPatient: 'Edit Patient Data',
    r_hideEdit: 'Close Edit',
    r_patientSaved: '✅ Patient data saved.',

    // manager modal
    m_titleMeds: 'Manage Medicines',
    m_titleIns: 'Manage Suggestions',
    m_addPh: 'Add new...',
    m_exists: 'This is already in the list.',
    m_edit: 'Edit',
    m_delete: 'Delete',
    m_save: 'Save',
    m_close: 'Close',
    m_delConfirm: 'Remove "{name}" from the list?',
    m_count: 'Total: {n}',

    // clinic
    c_titlePh: 'Note name (e.g. Stock, Reminder)',
    c_textPh: 'Write the clinic note...',
    c_add: 'Add Note',
    c_update: 'Update Note',
    c_cancelEdit: 'Cancel edit',
    c_total: 'Total notes: {n}',
    c_none: 'No notes yet.',
    c_edit: 'Edit',
    c_delete: 'Delete',
    c_delTitle: 'Delete Note',
    c_delMsg: 'Delete this note?',
    c_untitled: 'Note {n}',
    c_empty: 'Please write a note name or text.',
  },

  ur: {
    f_patientName: 'مریض کا نام',
    f_father: 'والد / شوہر کا نام',
    f_age: 'عمر',
    f_gender: 'جنس',
    f_marital: 'ازدواجی حیثیت',
    f_visit: 'وزٹ نمبر',
    f_phone: 'فون نمبر',
    f_email: 'ای میل',
    f_bp: 'بلڈ پریشر',
    f_sugar: 'شوگر لیول',
    f_city: 'شہر',
    f_country: 'ملک',
    f_address: 'موجودہ پتہ',
    f_symptoms: 'علامات',
    f_date: 'تاریخ',
    optional: '(اختیاری)',
    male: 'مرد',
    female: 'عورت',
    other: 'دیگر',
    single: 'غیر شادی شدہ',
    married: 'شادی شدہ',
    divorced: 'طلاق یافتہ',
    widowed: 'بیوہ / رنڈوا',
    cancel: 'منسوخ',
    error: 'خرابی',

    reg_visit_auto: 'وزٹ نمبر خود بخود لگ جاتا ہے',
    reg_visit_first: '1 (پہلی وزٹ)',
    reg_btn: 'مریض رجسٹر کریں',
    reg_missingTitle: 'معلومات ادھوری ہیں',
    reg_missingMsg: 'یہ خانے پُر کرنا ضروری ہیں:',
    reg_success: 'مریض کامیابی سے رجسٹر ہو گیا!',
    reg_fail: 'رجسٹریشن نہیں ہو سکی۔ انٹرنیٹ اور Firestore rules چیک کریں۔',
    dup_title: 'پہلے سے رجسٹرڈ ہے',
    dup_msgNew:
      '"{name}" پہلے سے رجسٹرڈ ہے (موجودہ وزٹ: {visit})۔\n\nمریض کو کھول کر نسخہ محفوظ کریں، وزٹ نمبر خود بخود {next} ہو جائے گا۔',
    dup_msgSame:
      '"{name}" پہلے سے رجسٹرڈ ہے (موجودہ وزٹ: {visit})۔\n\nآج کے نسخے میں تبدیلی کے لیے مریض کو کھولیں (وزٹ {visit})۔',
    dup_open: 'مریض کھولیں',

    l_search: 'نام یا فون سے تلاش کریں...',
    l_total: '{title}: {n}',
    h_patients: 'رجسٹرڈ مریض',
    h_prescriptions: 'نسخے',
    h_medicine: 'دوائیں',
    l_view: 'دیکھیں',
    l_edit: 'ترمیم',
    l_delete: 'حذف',
    l_reco: 'نسخہ تجویز',
    l_open: 'کھولیں / پرنٹ',
    l_none: 'کوئی مریض نہیں ملا۔',
    l_sdw: 'ولدیت / زوج',
    l_agePhone: 'عمر: {age}  •  فون: {phone}',
    l_meds: '{n} دوائیں تجویز ہیں',
    l_visit: 'وزٹ: {n}',
    l_delTitle: 'مریض حذف کریں',
    l_delMsg: 'کیا "{name}" کا ریکارڈ حذف کر دیں؟',
    l_loadErr: 'مریض لوڈ نہیں ہو سکے۔ انٹرنیٹ چیک کریں۔',
    l_delErr: 'حذف نہیں ہو سکا۔',

    d_registered: 'رجسٹریشن کی تاریخ',
    d_meds: 'تجویز کردہ دوائیں',
    d_edit: 'مریض میں ترمیم',
    d_reco: 'دوائیں تجویز کریں',
    d_notFound: 'مریض کا ریکارڈ نہیں ملا۔',
    d_loadErr: 'مریض لوڈ نہیں ہو سکا۔',
    e_save: 'تبدیلیاں محفوظ کریں',
    e_saved: 'تبدیلیاں محفوظ ہو گئیں!',
    e_saveErr: 'تبدیلیاں محفوظ نہیں ہو سکیں۔',
    e_nameReq: 'مریض کا نام لکھیں۔',

    r_meds: 'دوائیں (منتخب کرنے کے لیے ٹیپ کریں)',
    r_customPh: 'نئی دوا لکھیں',
    add: 'شامل کریں',
    r_selected: 'منتخب ({n})',
    r_none: 'ابھی کوئی دوا منتخب نہیں کی۔',
    remove: 'ہٹائیں',
    r_insPh: 'کھانے کا طریقہ',
    r_tapHint: 'طریقہ لکھنے کے لیے ٹیپ کریں',
    r_save: 'نسخہ محفوظ کریں',
    r_print: 'نسخہ پرنٹ کریں',
    r_share: 'PDF شیئر کریں',
    r_saved: '✅ محفوظ ہو گیا۔ یہ وزٹ نمبر {n} ہے۔',
    r_saveFail: '❌ نسخہ محفوظ نہیں ہو سکا۔',
    r_manageMeds: 'دوائیں سنبھالیں',
    r_manageIns: 'ہدایات سنبھالیں',
    r_lastRec: 'آخری نسخہ: {time}',
    r_visitNew: 'وزٹ #{cur} ہو چکی ہے۔ اب محفوظ کرنے سے وزٹ #{n} بنے گی۔',
    r_visitSame: 'موجودہ وزٹ: #{n}',
    r_printErr: 'پرنٹ نہیں ہو سکا۔',
    r_pdfErr: 'PDF نہیں بن سکی۔',
    r_insTitle: 'ہدایات (کھانے کا طریقہ)',
    r_editPatient: 'مریض کا ڈیٹا تبدیل کریں',
    r_hideEdit: 'ترمیم بند کریں',
    r_patientSaved: '✅ مریض کا ڈیٹا محفوظ ہو گیا۔',

    m_titleMeds: 'دوائیں سنبھالیں',
    m_titleIns: 'ہدایات سنبھالیں',
    m_addPh: 'نیا اضافہ کریں...',
    m_exists: 'یہ پہلے سے فہرست میں موجود ہے۔',
    m_edit: 'ترمیم',
    m_delete: 'حذف',
    m_save: 'محفوظ',
    m_close: 'بند کریں',
    m_delConfirm: 'کیا "{name}" کو فہرست سے ہٹا دیں؟',
    m_count: 'کل: {n}',

    c_titlePh: 'نوٹ کا نام (مثلاً اسٹاک، یاد دہانی)',
    c_textPh: 'کلینک نوٹ لکھیں...',
    c_add: 'نوٹ شامل کریں',
    c_update: 'نوٹ اپڈیٹ کریں',
    c_cancelEdit: 'ترمیم منسوخ کریں',
    c_total: 'کل نوٹس: {n}',
    c_none: 'ابھی کوئی نوٹ نہیں۔',
    c_edit: 'ترمیم',
    c_delete: 'حذف',
    c_delTitle: 'نوٹ حذف کریں',
    c_delMsg: 'کیا یہ نوٹ حذف کر دیں؟',
    c_untitled: 'نوٹ {n}',
    c_empty: 'نوٹ کا نام یا متن لکھیں۔',
  },
};

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k, isUr: false });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'ur' || v === 'en') setLangState(v);
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback((l) => {
    setLangState(l);
    AsyncStorage.setItem(KEY, l).catch(() => {});
  }, []);

  const value = useMemo(() => {
    const t = (key, params) => {
      let s = (STR[lang] && STR[lang][key]) || STR.en[key] || key;
      if (params) {
        Object.keys(params).forEach((k) => {
          s = s.split('{' + k + '}').join(String(params[k]));
        });
      }
      return s;
    };
    return { lang, setLang, t, isUr: lang === 'ur' };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
