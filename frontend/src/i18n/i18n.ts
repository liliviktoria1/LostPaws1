import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "header": {
        "home": "Home",
        "maps": "Maps",
        "announcements": "Announcements",
        "success_stories": "Success Stories",
        "contact": "Contact Us",
        "report_btn": "Report Pets",
        "my_reports": "My Reports",
        "my_profile": "My Profile",
        "messages": "Messages",
        "logout": "Log out",
        "login": "Log in",
        "signin": "Sign in",
        "notifications": "Notifications",
        "mark_all_read": "Mark all as read"
      },
      "home": {
        "hero_title": "Finding a friend together",
        "hero_subtitle": "Helping every pet find their home",
        "hero_h1_main": "Lost your pet? Don’t worry",
        "hero_h1_sub": "This site will help you find your lost family member.",
        "hero_p": "We search. We find. We reunite.",
        "missing_pets": "Missing Pets",
        "missing_pets_sub": "Help get these paws home",
        "found_pets": "Found Pets",
        "found_pets_sub": "Check if your lost paw is here",
        "browse_all": "Browse All",
        "mission_title": "Our Mission",
        "mission_text": "is an online platform for finding lost pets. We connect people who have lost their four-legged friends with those willing to help. Our goal is to make the search process fast, convenient, and effective using modern technology.",
        "how_title": "How It Works?",
        "how_step1_title": "Post a Listing",
        "how_step1_l1": "Describe your pet (species, breed, distinctive features).",
        "how_step1_l2": "Add photos and the last known location.",
        "how_step1_l3": "Provide contact details.",
        "how_step2_title": "Engage with the Community",
        "how_step2_l1": "Leave comments on listings (\"I spotted this pet here!\").",
        "how_step2_l2": "Get real-time notifications about new listings nearby.",
        "how_step3_title": "Search on the Map",
        "how_step3_l1": "Browse listings in your area.",
        "how_step3_l2": "Filter by pet type, date lost, or status (\"lost\"/\"found\").",
        "cta_title": "Find and Report Lost & Found Pets",
        "cta_text": "Fill out the advert form for search/find animals",
        "cta_btn": "Submit a Pet Alert",
        "missing_pets_empty": "No missing pets reported.",
      },
      "maps": {
        "sidebar_title": "Find Pets",
        "species_label": "Species",
        "status_label": "Status",
        "city_label": "City / Area",
        "all_animals": "All Animals",
        "all_statuses": "All Statuses",
        "found_reports": "Found {{count}} reports",
        "reset_filters": "Reset Filters",
        "view_details": "VIEW DETAILS"
      },
      "announcements": {
        "title": "Pet Announcements",
        "subtitle": "Browse current lost and found reports",
        "filter_title": "Filter Pets",
        "any_sex": "Any Sex",
        "any_age": "Any Age",
        "clear_filters": "Clear all filters",
        "no_results": "No announcements found matching your filters.",
        "loading": "Loading announcements...",
        "previous": "Previous",
        "next": "Next"
      },
      "form": {
        "title": "Report a Pet",
        "pet_name": "Pet Name",
        "species": "Species",
        "breed": "Breed",
        "color": "Color",
        "age": "Age",
        "sex": "Sex",
        "status": "Status",
        "description": "Description",
        "photos": "Photos",
        "upload_text": "Click or drag photos here to upload",
        "location": "Last Seen Location",
        "detect_loc": "Detect My Location",
        "contact_info": "Contact Information",
        "your_name": "Your Name",
        "phone": "Phone Number",
        "email": "Email",
        "submit": "Send Alert",
        "success_title": "Report Submitted!",
        "success_text": "Our AI is currently scanning the database for potential matches."
      },
      "pet_detail": {
        "title": "Pet Details",
        "reasoning": "AI Match Reasoning",
        "contact": "Contact Information",
        "message_owner": "Message Owner",
        "matches_found": "AI Matches Found",
        "no_matches": "No visual matches found yet.",
        "scanning": "AI scanning in progress...",
        "other_missing": "Other Missing Pets",
        "share_title": "Share this report",
        "share_desc": "Help this pet get home by sharing with your community.",
        "was_last_seen": "was last seen here",
        "was_found": "was found here"
      },
      "success_stories_page": {
        "title": "Success Stories",
        "subtitle": "These paws have found their way back home thanks to our community and AI.",
        "empty_text": "No success stories yet. Help us create one!"
      },
      "profile_page": {
        "title": "My Profile",
        "subtitle": "Manage your account settings and contact details.",
        "personal_info": "Personal Information",
        "full_name": "Full Name",
        "phone_number": "Phone Number",
        "email_address": "Email Address",
        "security": "Security",
        "new_password": "New Password",
        "password_hint": "Leave blank to keep current password",
        "save_btn": "Save Changes",
        "success_msg": "Profile updated successfully!",
        "member_since": "Member since"
      },
      "my_reports_page": {
        "title": "My Pet Reports",
        "subtitle": "Manage your reported lost and found pets here.",
        "empty_text": "You haven't submitted any reports yet.",
        "cta_btn": "Create a Pet Alert",
        "mark_reunited_btn": "🎉 Mark as Reunited",
        "edit_btn": "Edit Report",
        "confirm_msg": "Is your pet reunited? This will move it to Success Stories!"
      },
      "contact_page": {
        "title": "Get in Touch",
        "subtitle": "Have questions or need help? Our team is here for you and your paws.",
        "info_title": "Contact Information",
        "email_label": "Email Us",
        "phone_label": "Call Us",
        "office_label": "Our Office",
        "form_title": "Send us a Message",
        "name_placeholder": "Your Full Name",
        "email_placeholder": "Your Email Address",
        "subject_label": "Subject",
        "message_label": "How can we help?",
        "send_btn": "Send Message",
        "success_msg": "Thank you! Your message has been sent successfully."
      },
      "footer": {
        "support_title": "Technical support",
        "nav_home": "Home",
        "nav_maps": "Maps",
        "nav_contact": "Contact Us",
        "nav_announcements": "Announcements"
      },
      "common": {
        "dog": "Dog",
        "cat": "Cat",
        "other": "Other",
        "lost": "Lost",
        "found": "Found",
        "male": "Male",
        "female": "Female",
        "unknown": "Unknown",
        "baby": "Baby",
        "young": "Young",
        "adult": "Adult",
        "senior": "Senior",
        "loading": "Loading...",
        "reunited_tag": "🏠 REUNITED"
      }
    }
  },
  ua: {
    translation: {
      "header": {
        "home": "Головна",
        "maps": "Мапа",
        "announcements": "Оголошення",
        "success_stories": "Щасливі історії",
        "contact": "Контакти",
        "report_btn": "Подати оголошення",
        "my_reports": "Мої звіти",
        "my_profile": "Мій профіль",
        "messages": "Повідомлення",
        "logout": "Вийти",
        "login": "Увійти",
        "signin": "Реєстрація",
        "notifications": "Сповіщення",
        "mark_all_read": "Прочитати всі"
      },
      "home": {
        "hero_title": "Знайдемо друга разом",
        "hero_subtitle": "Допомагаємо кожній тварині повернутися додому",
        "hero_h1_main": "Загубили улюбленця? Не хвилюйтеся",
        "hero_h1_sub": "Цей сайт допоможе вам знайти вашого загубленого члена сім'ї.",
        "hero_p": "Ми шукаємо. Ми знаходимо. Ми об'єднуємо.",
        "missing_pets": "Загублені",
        "missing_pets_sub": "Допоможіть цим лапкам повернутися додому",
        "found_pets": "Знайдені",
        "found_pets_sub": "Перевірте, чи не ваш улюбленець тут",
        "browse_all": "Переглянути всі",
        "mission_title": "Наша місія",
        "mission_text": "— це онлайн-платформа для пошуку загублених тварин. Ми об'єднуємо людей, які втратили своїх чотирилапих друзів, з тими, хто готовий допомогти. Наша мета — зробити процес пошуку швидким, зручним та ефективним за допомогою сучасних технологій.",
        "how_title": "Як це працює?",
        "how_step1_title": "Подати оголошення",
        "how_step1_l1": "Опишіть свого улюбленця (вид, порода, особливі прикмети).",
        "how_step1_l2": "Додайте фотографії та останнє відоме місцезнаходження.",
        "how_step1_l3": "Вкажіть контактні дані.",
        "how_step2_title": "Взаємодія з громадою",
        "how_step2_l1": "Залишайте коментарі под оголошеннями (\"Я бачив цю тварину тут!\").",
        "how_step2_l2": "Отримуйте сповіщення в реальному часі про нові оголошення поблизу.",
        "how_step3_title": "Пошук на мапі",
        "how_step3_l1": "Переглядайте оголошення у вашому районі.",
        "how_step3_l2": "Фільтруйте за типом тварини, датою зникнення або статусом (\"загублено\"/\"знайдено\").",
        "cta_title": "Знайдіть та повідомте про загублених та знайдених тварин",
        "cta_text": "Заповніть форму оголошення для пошуку тварин",
        "cta_btn": "Подати оголошення",
        "missing_pets_empty": "Загублених тварин не знайдено.",
        "found_pets_empty": "Знайдених тварин не знайдено."
      },
      "maps": {
        "sidebar_title": "Пошук",
        "species_label": "Вид",
        "status_label": "Статус",
        "city_label": "Місто / Район",
        "all_animals": "Всі тварини",
        "all_statuses": "Будь-який статус",
        "found_reports": "Знайдено: {{count}}",
        "reset_filters": "Скинути фільтри",
        "view_details": "ДЕТАЛЬНІШЕ"
      },
      "announcements": {
        "title": "Оголошення про тварин",
        "subtitle": "Перегляньте актуальні повідомлення про знайдених та загублених улюбленців",
        "filter_title": "Фільтр",
        "any_sex": "Будь-яка стать",
        "any_age": "Будь-який вік",
        "clear_filters": "Скинути всі фільтри",
        "no_results": "Нічого не знайдено за вашим запитом.",
        "loading": "Завантаження оголошень...",
        "previous": "Попередня",
        "next": "Наступна"
      },
      "form": {
        "title": "Подати оголошення",
        "pet_name": "Кличка тварини",
        "species": "Вид",
        "breed": "Порода",
        "color": "Забарвлення",
        "age": "Вік",
        "sex": "Стать",
        "status": "Статус",
        "description": "Опис",
        "photos": "Фотографії",
        "upload_text": "Натисніть або перетягніть фото сюди",
        "location": "Місце знаходження",
        "detect_loc": "Визначити мою локацію",
        "contact_info": "Контактна інформація",
        "your_name": "Ваше ім'я",
        "phone": "Номер телефону",
        "email": "Електронна пошта",
        "submit": "Надіслати",
        "success_title": "Оголошення подано!",
        "success_text": "Наш ШІ вже перевіряє базу даних на наявність збігів."
      },
      "pet_detail": {
        "title": "Деталі тварини",
        "reasoning": "Обґрунтування ШІ",
        "contact": "Контакти власника",
        "message_owner": "Написати власнику",
        "matches_found": "Знайдені збіги (ШІ)",
        "no_matches": "Візуальних збігів поки не знайдено.",
        "scanning": "Триває сканування ШІ...",
        "other_missing": "Інші загублені тварини",
        "share_title": "Поділитися оголошенням",
        "share_desc": "Допоможіть тварині повернутися додому, поширивши інформацію.",
        "was_last_seen": "востаннє бачили тут",
        "was_found": "було знайдено тут"
      },
      "success_stories_page": {
        "title": "Щасливі історії",
        "subtitle": "Ці лапки повернулися додому завдяки нашій громаді та ШІ.",
        "empty_text": "Поки що немає щасливих історій. Допоможіть нам створити першу!"
      },
      "profile_page": {
        "title": "Мій профіль",
        "subtitle": "Керуйте налаштуваннями акаунта та контактними даними.",
        "personal_info": "Особиста інформація",
        "full_name": "Повне ім'я",
        "phone_number": "Номер телефону",
        "email_address": "Електронна пошта",
        "security": "Безпека",
        "new_password": "Новий пароль",
        "password_hint": "Залиште порожнім, щоб не змінювати",
        "save_btn": "Зберегти зміни",
        "success_msg": "Профіль успішно оновлено!",
        "member_since": "З нами з"
      },
      "my_reports_page": {
        "title": "Мої звіти",
        "subtitle": "Керуйте своїми повідомленнями про загублених та знайдених тварин тут.",
        "empty_text": "Ви ще не подали жодного оголошення.",
        "cta_btn": "Подати оголошення",
        "mark_reunited_btn": "🎉 Повернувся додому",
        "edit_btn": "Редагувати",
        "confirm_msg": "Ваш улюбленець повернувся? Це перенесе оголошення в Щасливі історії!"
      },
      "contact_page": {
        "title": "Зв'яжіться з нами",
        "subtitle": "Маєте запитання чи потребуєте допомоги? Наша команда завжди поруч.",
        "info_title": "Контактна інформація",
        "email_label": "Напишіть нам",
        "phone_label": "Зателефонуйте",
        "office_label": "Наш офіс",
        "form_title": "Надішліть нам повідомлення",
        "name_placeholder": "Ваше повне ім'я",
        "email_placeholder": "Електронна адреса",
        "subject_label": "Тема",
        "message_label": "Як ми можемо допомогти?",
        "send_btn": "Надіслати повідомлення",
        "success_msg": "Дякуємо! Ваше повідомлення було успішно надіслано."
      },
      "footer": {
        "support_title": "Технічна підтримка",
        "nav_home": "Головна",
        "nav_maps": "Мапа",
        "nav_contact": "Контакти",
        "nav_announcements": "Оголошення"
      },
      "common": {
        "dog": "Пес",
        "cat": "Кіт",
        "other": "Інше",
        "lost": "Загублено",
        "found": "Знайдено",
        "male": "Самець",
        "female": "Самка",
        "unknown": "Невідомо",
        "baby": "Маля",
        "young": "Молодий",
        "adult": "Дорослий",
        "senior": "Старий",
        "loading": "Завантаження...",
        "reunited_tag": "🏠 ВЕРНУВСЯ ДОДОМУ"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
