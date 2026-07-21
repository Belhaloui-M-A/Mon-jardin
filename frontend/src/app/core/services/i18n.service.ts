import { Injectable, signal, effect } from '@angular/core';

export type Lang = 'fr' | 'ar';

export interface Translations {
  // NAV
  nav_home: string;
  nav_catalogue: string;
  nav_orders: string;
  nav_wishlist: string;
  nav_dashboard: string;
  nav_plants: string;
  nav_categories: string;
  nav_login: string;
  nav_register: string;
  nav_profile: string;
  nav_users: string;
  nav_logout: string;
  nav_cart: string;

  // HOME
  home_badge: string;
  home_title1: string;
  home_title2: string;
  home_sub: string;
  home_cta_explore: string;
  home_cta_register: string;
  home_stat_varieties: string;
  home_stat_categories: string;
  home_stat_delivery: string;
  home_stat_satisfaction: string;
  home_scroll: string;
  home_collections: string;
  home_collections_title: string;
  home_collections_sub: string;
  home_featured_label: string;
  home_featured_title: string;
  home_catalogue_label: string;
  home_catalogue_title: string;
  home_see_all: string;
  home_cta_title: string;
  home_cta_sub: string;
  home_cta_btn: string;
  home_stock_limited: string;

  // CATEGORIES
  cat_interior: string;
  cat_exterior: string;
  cat_succulents: string;
  cat_aromatic: string;
  cat_tropical: string;

  // CATALOGUE
  catalogue_label: string;
  catalogue_title: string;
  catalogue_search: string;
  catalogue_filters: string;
  catalogue_category: string;
  catalogue_all: string;
  catalogue_max_price: string;
  catalogue_stock_only: string;
  catalogue_stock_label: string;
  catalogue_sort_by: string;
  catalogue_sort_new: string;
  catalogue_sort_asc: string;
  catalogue_sort_desc: string;
  catalogue_sort_az: string;
  catalogue_reset: string;
  catalogue_results: string;
  catalogue_plants: string;
  catalogue_no_result: string;
  catalogue_no_result_sub: string;
  catalogue_reset_filters: string;
  catalogue_limited: string;
  catalogue_rupture: string;
  catalogue_new: string;

  // PLANT DETAIL
  detail_category: string;
  detail_in_stock: string;
  detail_low_stock: string;
  detail_out_stock: string;
  detail_watering: string;
  detail_light: string;
  detail_add_cart: string;
  detail_similar: string;
  detail_toxic: string;
  detail_size: string;

  // DIFFICULTIES
  diff_easy: string;
  diff_medium: string;
  diff_hard: string;

  // CART
  cart_label: string;
  cart_title: string;
  cart_empty: string;
  cart_empty_sub: string;
  cart_discover: string;
  cart_unit: string;
  cart_subtotal: string;
  cart_delivery: string;
  cart_included: string;
  cart_total: string;
  cart_checkout: string;
  cart_continue: string;
  cart_clear: string;
  cart_summary: string;

  // CHECKOUT
  checkout_label: string;
  checkout_title: string;
  checkout_step1: string;
  checkout_address: string;
  checkout_city: string;
  checkout_phone: string;
  checkout_notes: string;
  checkout_notes_ph: string;
  checkout_step2: string;
  checkout_confirm: string;
  checkout_back: string;
  checkout_delivery_incl: string;
  checkout_success_title: string;
  checkout_success_sub: string;
  checkout_success_msg: string;
  checkout_track: string;
  checkout_continue: string;

  // ORDERS
  orders_label: string;
  orders_title: string;
  orders_order: string;
  orders_empty: string;
  orders_empty_sub: string;
  orders_cancel: string;
  orders_address: string;
  orders_status_pending: string;
  orders_status_confirmed: string;
  orders_status_shipped: string;
  orders_status_delivered: string;
  orders_status_cancelled: string;

  // WISHLIST
  wishlist_label: string;
  wishlist_title: string;
  wishlist_empty: string;
  wishlist_empty_sub: string;
  wishlist_add_cart: string;

  // PROFILE
  profile_label: string;
  profile_title: string;
  profile_first_name: string;
  profile_last_name: string;
  profile_phone: string;
  profile_email: string;
  profile_address: string;
  profile_save: string;
  profile_my_orders: string;
  profile_my_wishlist: string;
  profile_modify: string;
  profile_orders_sub: string;
  profile_wishlist_sub: string;

  // AUTH
  auth_login_title: string;
  auth_login_sub: string;
  auth_email: string;
  auth_password: string;
  auth_login_btn: string;
  auth_no_account: string;
  auth_demo: string;
  auth_register_title: string;
  auth_register_sub: string;
  auth_register_btn: string;
  auth_have_account: string;
  auth_password_min: string;

  // ADMIN DASHBOARD
  admin_label: string;
  admin_dashboard: string;
  admin_new_plant: string;
  admin_revenue: string;
  admin_revenue_month: string;
  admin_pending_orders: string;
  admin_to_process: string;
  admin_clients: string;
  admin_low_stock: string;
  admin_low_stock_sub: string;
  admin_sales_chart: string;
  admin_top_sales: string;
  admin_no_sales: string;
  admin_alerts: string;
  admin_manage_plants: string;
  admin_crud: string;
  admin_manage_orders: string;
  admin_manage_statuses: string;
  admin_manage_users: string;
  admin_manage_accounts: string;
  admin_quick_links: string;

  // ADMIN PLANTS
  admin_plants_label: string;
  admin_plants_title: string;
  admin_plants_count: string;
  admin_plant_name: string;
  admin_plant_species: string;
  admin_plant_category: string;
  admin_plant_price: string;
  admin_plant_stock: string;
  admin_plant_difficulty: string;
  admin_plant_status: string;
  admin_plant_actions: string;
  admin_plant_active: string;
  admin_plant_inactive: string;
  admin_plant_new: string;
  admin_plant_edit: string;
  admin_plant_delete_confirm: string;
  admin_plant_watering: string;
  admin_plant_light: string;
  admin_plant_size: string;
  admin_plant_discount: string;
  admin_plant_description: string;
  admin_plant_image_url: string;
  admin_cancel: string;
  admin_create: string;
  admin_edit_btn: string;

  // ADMIN ORDERS
  admin_orders_label: string;
  admin_orders_title: string;
  admin_orders_id: string;
  admin_orders_client: string;
  admin_orders_date: string;
  admin_orders_total: string;
  admin_orders_status: string;
  admin_orders_change: string;
  admin_orders_items: string;
  admin_orders_delivery: string;
  admin_orders_confirm_btn: string;
  admin_orders_ship_btn: string;
  admin_orders_deliver_btn: string;
  admin_orders_cancel_btn: string;
  admin_orders_none: string;

  // ADMIN USERS
  admin_users_label: string;
  admin_users_title: string;
  admin_users_count: string;
  admin_users_user: string;
  admin_users_email: string;
  admin_users_phone: string;
  admin_users_role: string;
  admin_users_status: string;
  admin_users_joined: string;
  admin_users_actions: string;
  admin_users_active: string;
  admin_users_disabled: string;
  admin_users_protected: string;
  admin_users_none: string;
  admin_users_create: string;
  admin_users_create_title: string;
  admin_users_role_admin: string;
  admin_users_role_client: string;


  // REVIEWS
  review_title: string;
  review_sub: string;
  review_write: string;
  review_edit: string;
  review_your_rating: string;
  review_service: string;
  review_delivery: string;
  review_quality: string;
  review_overall: string;
  review_comment_ph: string;
  review_submit: string;
  review_update: string;
  review_cancel: string;
  review_success: string;
  review_already: string;
  review_login_required: string;
  review_based_on: string;
  review_ratings: string;
  review_no_reviews: string;
  review_verified: string;
  review_label: string;
  review_avg: string;
  review_rating_1: string;
  review_rating_2: string;
  review_rating_3: string;
  review_rating_4: string;
  review_rating_5: string;
  review_select_rating: string;
  review_deleted: string;
  page_prev: string;
  page_next: string;
  page_number: string;

  // FOOTER
  footer_nav: string;
  footer_contact: string;
  footer_delivery: string;
  footer_payment: string;
  footer_hours: string;
  footer_rights: string;
}

const FR: Translations = {
  nav_home: 'Accueil', nav_catalogue: 'Catalogue', nav_orders: 'Commandes',
  nav_wishlist: 'Favoris ♥', nav_dashboard: 'Dashboard', nav_plants: 'Plantes',
  nav_categories: 'Catégories',
  nav_login: 'Connexion', nav_register: "S'inscrire", nav_profile: 'Mon profil',
  nav_users: 'Utilisateurs', nav_logout: 'Déconnexion', nav_cart: 'Panier',

  home_badge: 'Livraison partout en Algérie',
  home_title1: 'La nature chez vous,', home_title2: 'à portée de clic',
  home_sub: 'Des plantes soigneusement sélectionnées — livrées avec leurs conseils d\'entretien personnalisés.',
  home_cta_explore: 'Explorer le catalogue', home_cta_register: 'Créer un compte',
  home_stat_varieties: 'Variétés', home_stat_categories: 'Catégories',
  home_stat_delivery: 'Livraison', home_stat_satisfaction: 'Satisfaction',
  home_scroll: 'Défiler pour explorer',
  home_collections: 'Collections', home_collections_title: 'Nos catégories',
  home_collections_sub: 'Trouvez la plante parfaite pour chaque espace',
  home_featured_label: 'Coup de cœur', home_featured_title: 'Plante du mois',
  home_catalogue_label: 'Catalogue', home_catalogue_title: 'Nouveautés',
  home_see_all: 'Voir tout',
  home_cta_title: 'Prêt à verdir votre espace ?',
  home_cta_sub: 'Créez votre compte gratuitement et profitez de conseils personnalisés.',
  home_cta_btn: 'Commencer mes achats',
  home_stock_limited: 'Stock limité',

  cat_interior: 'Intérieur', cat_exterior: 'Extérieur',
  cat_succulents: 'Succulentes & Cactus', cat_aromatic: 'Aromatiques', cat_tropical: 'Tropicales',

  catalogue_label: 'Boutique', catalogue_title: 'Catalogue',
  catalogue_search: 'Rechercher une plante, espèce...',
  catalogue_filters: 'Filtres', catalogue_category: 'Catégorie', catalogue_all: 'Toutes',
  catalogue_max_price: 'Prix max', catalogue_stock_only: 'En stock uniquement',
  catalogue_stock_label: 'Stock', catalogue_sort_by: 'Trier par',
  catalogue_sort_new: 'Plus récent', catalogue_sort_asc: 'Prix croissant',
  catalogue_sort_desc: 'Prix décroissant', catalogue_sort_az: 'Nom A–Z',
  catalogue_reset: '↺ Réinitialiser', catalogue_results: 'plantes',
  catalogue_plants: 'plantes trouvées',
  catalogue_no_result: 'Aucune plante trouvée', catalogue_no_result_sub: 'Essayez de modifier vos filtres',
  catalogue_reset_filters: 'Réinitialiser les filtres',
  catalogue_limited: 'restants', catalogue_rupture: 'Rupture', catalogue_new: 'Nouveau',

  detail_category: 'Catégorie', detail_in_stock: '✅ En stock',
  detail_low_stock: '⚠️ Stock limité', detail_out_stock: '❌ Rupture',
  detail_watering: 'Arrosage', detail_light: 'Lumière',
  detail_add_cart: 'Ajouter au panier', detail_similar: 'Vous aimerez aussi',
  detail_toxic: '⚠️ Toxique animaux', detail_size: 'Taille',

  diff_easy: 'FACILE', diff_medium: 'MOYEN', diff_hard: 'DIFFICILE',

  cart_label: 'Achat', cart_title: 'Mon panier', cart_empty: 'Panier vide',
  cart_empty_sub: 'Ajoutez des plantes depuis notre catalogue',
  cart_discover: 'Découvrir le catalogue', cart_unit: '/ unité',
  cart_subtotal: 'Sous-total', cart_delivery: 'Livraison', cart_included: 'Incluse',
  cart_total: 'Total', cart_checkout: 'Commander', cart_continue: '← Continuer mes achats',
  cart_clear: 'Vider le panier', cart_summary: 'Récapitulatif',

  checkout_label: 'Achat', checkout_title: 'Finaliser la commande',
  checkout_step1: 'Adresse de livraison', checkout_address: 'Adresse *',
  checkout_city: 'Ville / Wilaya *', checkout_phone: 'Téléphone *',
  checkout_notes: 'Instructions (optionnel)',
  checkout_notes_ph: 'Interphone, étage, instructions particulières...',
  checkout_step2: 'Votre commande', checkout_confirm: 'Confirmer la commande',
  checkout_back: '← Modifier le panier', checkout_delivery_incl: 'Livraison incluse',
  checkout_success_title: 'Commande confirmée !',
  checkout_success_sub: 'Vous serez contacté pour confirmer la livraison.',
  checkout_success_msg: 'enregistrée avec succès.', checkout_track: 'Suivre ma commande',
  checkout_continue: 'Continuer mes achats',

  orders_label: 'Historique', orders_title: 'Mes commandes',
  orders_order: 'Commande',
  orders_empty: 'Aucune commande', orders_empty_sub: 'Vous n\'avez pas encore passé de commande',
  orders_cancel: 'Annuler', orders_address: 'Adresse',
  orders_status_pending: 'En attente', orders_status_confirmed: 'Confirmée',
  orders_status_shipped: 'Expédiée', orders_status_delivered: 'Livrée',
  orders_status_cancelled: 'Annulée',

  wishlist_label: 'Favoris', wishlist_title: '❤️ Mes favoris',
  wishlist_empty: 'Aucun favori', wishlist_empty_sub: 'Cliquez sur ♡ sur une fiche plante pour l\'ajouter ici',
  wishlist_add_cart: 'Panier',

  profile_label: 'Compte', profile_title: 'Mon profil',
  profile_first_name: 'Prénom *', profile_last_name: 'Nom *',
  profile_phone: 'Téléphone', profile_email: 'Email',
  profile_address: 'Adresse de livraison', profile_save: 'Enregistrer',
  profile_my_orders: 'Mes commandes', profile_my_wishlist: 'Mes favoris',
  profile_modify: 'Modifier mes informations',
  profile_orders_sub: 'Suivi & historique', profile_wishlist_sub: 'Plantes sauvegardées',

  auth_login_title: 'PlantVerde', auth_login_sub: 'Connectez-vous à votre compte',
  auth_email: 'Adresse email', auth_password: 'Mot de passe',
  auth_login_btn: 'Se connecter', auth_no_account: 'Pas encore de compte ?',
  auth_demo: 'Comptes de démonstration',
  auth_register_title: 'Créer un compte', auth_register_sub: 'Rejoignez la communauté PlantVerde',
  auth_register_btn: 'Créer mon compte', auth_have_account: 'Déjà un compte ?',
  auth_password_min: 'Minimum 8 caractères',

  admin_label: 'Administration', admin_dashboard: 'Dashboard', admin_new_plant: 'Nouvelle plante',
  admin_revenue: 'Chiffre d\'affaires total', admin_revenue_month: 'ce mois',
  admin_pending_orders: 'Commandes à traiter', admin_to_process: 'Prioritaires',
  admin_clients: 'Clients inscrits', admin_low_stock: 'Stock faible',
  admin_low_stock_sub: 'Moins de 5 unités', admin_sales_chart: 'Ventes — 30 derniers jours',
  admin_top_sales: '🏆 Top ventes', admin_no_sales: 'Aucune vente',
  admin_alerts: '⚠️ Alertes stock faible',
  admin_manage_plants: 'Gestion Plantes', admin_crud: 'CRUD catalogue',
  admin_manage_orders: 'Commandes', admin_manage_statuses: 'Gérer les statuts',
  admin_manage_users: 'Utilisateurs', admin_manage_accounts: 'Gérer les comptes',
  admin_quick_links: 'Accès rapide',

  admin_plants_label: 'Administration', admin_plants_title: 'Gestion des plantes',
  admin_plants_count: 'plantes au catalogue', admin_plant_name: 'Nom *',
  admin_plant_species: 'Espèce', admin_plant_category: 'Catégorie *',
  admin_plant_price: 'Prix (DA) *', admin_plant_stock: 'Stock *',
  admin_plant_difficulty: 'Difficulté', admin_plant_status: 'Statut',
  admin_plant_actions: 'Actions', admin_plant_active: 'Actif', admin_plant_inactive: 'Inactif',
  admin_plant_new: 'Nouvelle plante', admin_plant_edit: 'Modifier la plante',
  admin_plant_delete_confirm: 'Supprimer cette plante ?',
  admin_plant_watering: 'Arrosage', admin_plant_light: 'Lumière',
  admin_plant_size: 'Taille adulte', admin_plant_discount: 'Remise (%)',
  admin_plant_description: 'Description', admin_plant_image_url: 'URL Image',
  admin_cancel: 'Annuler', admin_create: 'Créer', admin_edit_btn: 'Modifier',

  admin_orders_label: 'Administration', admin_orders_title: 'Gestion des commandes',
  admin_orders_id: '#', admin_orders_client: 'Client', admin_orders_date: 'Date',
  admin_orders_total: 'Total', admin_orders_status: 'Statut', admin_orders_change: 'Changer statut',
  admin_orders_items: 'Articles', admin_orders_delivery: 'Livraison',
  admin_orders_confirm_btn: 'Confirmer', admin_orders_ship_btn: 'Expédier',
  admin_orders_deliver_btn: 'Marquer livré', admin_orders_cancel_btn: 'Annuler',
  admin_orders_none: 'Aucune commande',

  admin_users_label: 'Administration', admin_users_title: 'Gestion des utilisateurs',
  admin_users_count: 'comptes enregistrés', admin_users_user: 'Utilisateur',
  admin_users_email: 'Email', admin_users_phone: 'Téléphone', admin_users_role: 'Rôle',
  admin_users_status: 'Statut', admin_users_joined: 'Inscription', admin_users_actions: 'Actions',
  admin_users_active: 'Actif', admin_users_disabled: 'Désactivé',
  admin_users_protected: 'Protégé', admin_users_none: 'Aucun utilisateur',
  admin_users_create: 'Créer un compte', admin_users_create_title: 'Nouvel utilisateur',
  admin_users_role_admin: 'Administrateur', admin_users_role_client: 'Client',

  review_title: 'Évaluations clients', review_sub: 'Ce que pensent nos clients',
  review_write: 'Évaluer le service', review_edit: 'Modifier mon avis',
  review_your_rating: 'Votre note', review_service: 'Service client',
  review_delivery: 'Livraison', review_quality: 'Qualité des plantes',
  review_overall: 'Impression générale', review_comment_ph: 'Partagez votre expérience...',
  review_submit: 'Publier mon avis', review_update: 'Mettre à jour',
  review_cancel: 'Annuler', review_success: 'Merci pour votre avis !',
  review_already: 'Vous avez déjà évalué ce service.',
  review_login_required: 'Connectez-vous pour évaluer',
  review_based_on: 'Basé sur', review_ratings: 'avis', review_no_reviews: 'Aucun avis pour l\'instant',
  review_verified: 'Achat vérifié', review_label: '⭐ Avis', review_avg: 'Note moyenne',
  review_rating_1: 'Très mauvais', review_rating_2: 'Mauvais', review_rating_3: 'Correct',
  review_rating_4: 'Bien', review_rating_5: 'Excellent',
  review_select_rating: 'Sélectionnez une note', review_deleted: 'Avis supprimé',
  page_prev: '← Précédent', page_next: 'Suivant →', page_number: 'Page',
  footer_nav: 'Navigation', footer_contact: 'Contact',
  footer_delivery: '🌍 Algérie', footer_payment: '✅ Paiement livraison',
  footer_hours: 'Lun–Sam : 8h–18h', footer_rights: 'Tous droits réservés.',
};




const AR: Translations = {
  nav_home: 'الرئيسية', nav_catalogue: 'المتجر', nav_orders: 'الطلبات',
  nav_wishlist: 'المفضلة ♥', nav_dashboard: 'لوحة التحكم', nav_plants: 'النباتات',
  nav_categories: 'الفئات',
  nav_login: 'تسجيل الدخول', nav_register: 'إنشاء حساب', nav_profile: 'ملفي الشخصي',
  nav_users: 'المستخدمون', nav_logout: 'تسجيل الخروج', nav_cart: 'السلة',

  home_badge: 'التوصيل عبر الجزائر',
  home_title1: 'الطبيعة في منزلك،', home_title2: 'بنقرة واحدة',
  home_sub: 'نباتات مختارة بعناية — تُسلَّم مع نصائح العناية الشخصية.',
  home_cta_explore: 'استكشاف المتجر', home_cta_register: 'إنشاء حساب',
  home_stat_varieties: 'صنف', home_stat_categories: 'فئات',
  home_stat_delivery: 'توصيل', home_stat_satisfaction: 'رضا',
  home_scroll: 'اسحب للاستكشاف',
  home_collections: 'المجموعات', home_collections_title: 'فئاتنا',
  home_collections_sub: 'ابحث عن النبات المثالي لكل مكان',
  home_featured_label: 'مميز', home_featured_title: 'نبات الشهر',
  home_catalogue_label: 'المتجر', home_catalogue_title: 'وصل حديثًا',
  home_see_all: 'عرض الكل',
  home_cta_title: 'هل أنت مستعد لإضفاء الخضرة على مساحتك؟',
  home_cta_sub: 'أنشئ حسابك مجاناً واحصل على نصائح عناية مخصصة.',
  home_cta_btn: 'ابدأ التسوق',
  home_stock_limited: 'مخزون محدود',

  cat_interior: 'نباتات داخلية', cat_exterior: 'نباتات خارجية',
  cat_succulents: 'نباتات صحراوية', cat_aromatic: 'نباتات عطرية', cat_tropical: 'نباتات استوائية',

  catalogue_label: 'المتجر', catalogue_title: 'الكتالوج',
  catalogue_search: 'ابحث عن نبات أو نوع...',
  catalogue_filters: 'الفلاتر', catalogue_category: 'الفئة', catalogue_all: 'الكل',
  catalogue_max_price: 'الحد الأقصى للسعر', catalogue_stock_only: 'المتوفر فقط',
  catalogue_stock_label: 'المخزون', catalogue_sort_by: 'ترتيب حسب',
  catalogue_sort_new: 'الأحدث', catalogue_sort_asc: 'السعر من الأقل',
  catalogue_sort_desc: 'السعر من الأكثر', catalogue_sort_az: 'الاسم أ–ي',
  catalogue_reset: '↺ إعادة تعيين', catalogue_results: 'نبات',
  catalogue_plants: 'نبات موجود',
  catalogue_no_result: 'لا توجد نباتات', catalogue_no_result_sub: 'حاول تعديل الفلاتر',
  catalogue_reset_filters: 'إعادة تعيين الفلاتر',
  catalogue_limited: 'متبقٍ', catalogue_rupture: 'نفد المخزون', catalogue_new: 'جديد',

  detail_category: 'الفئة', detail_in_stock: '✅ متوفر',
  detail_low_stock: '⚠️ مخزون محدود', detail_out_stock: '❌ نفد المخزون',
  detail_watering: 'الري', detail_light: 'الضوء',
  detail_add_cart: 'أضف إلى السلة', detail_similar: 'قد يعجبك أيضًا',
  detail_toxic: '⚠️ سام للحيوانات', detail_size: 'الحجم',

  diff_easy: 'سهل', diff_medium: 'متوسط', diff_hard: 'صعب',

  cart_label: 'التسوق', cart_title: 'سلتي', cart_empty: 'السلة فارغة',
  cart_empty_sub: 'أضف نباتات من متجرنا',
  cart_discover: 'استكشاف المتجر', cart_unit: '/ وحدة',
  cart_subtotal: 'المجموع الفرعي', cart_delivery: 'التوصيل', cart_included: 'مجاني',
  cart_total: 'الإجمالي', cart_checkout: 'إتمام الطلب', cart_continue: 'مواصلة التسوق ←',
  cart_clear: 'إفراغ السلة', cart_summary: 'ملخص الطلب',

  checkout_label: 'الدفع', checkout_title: 'إتمام الطلب',
  checkout_step1: 'عنوان التوصيل', checkout_address: 'العنوان *',
  checkout_city: 'المدينة / الولاية *', checkout_phone: 'الهاتف *',
  checkout_notes: 'تعليمات (اختياري)',
  checkout_notes_ph: 'الدور، جرس الباب، تعليمات خاصة...',
  checkout_step2: 'طلبك', checkout_confirm: 'تأكيد الطلب',
  checkout_back: 'تعديل السلة ←', checkout_delivery_incl: 'توصيل مجاني',
  checkout_success_title: 'تم تأكيد الطلب!',
  checkout_success_sub: 'سيتم التواصل معك لتأكيد التوصيل.',
  checkout_success_msg: 'تم بنجاح.', checkout_track: 'تتبع طلبي',
  checkout_continue: 'مواصلة التسوق',

  orders_label: 'السجل', orders_title: 'طلباتي',
  orders_order: 'طلب',
  orders_empty: 'لا توجد طلبات', orders_empty_sub: 'لم تقم بأي طلب بعد',
  orders_cancel: 'إلغاء', orders_address: 'العنوان',
  orders_status_pending: 'قيد الانتظار', orders_status_confirmed: 'تم التأكيد',
  orders_status_shipped: 'تم الشحن', orders_status_delivered: 'تم التسليم',
  orders_status_cancelled: 'ملغي',

  wishlist_label: 'المفضلة', wishlist_title: '❤️ قائمة المفضلة',
  wishlist_empty: 'لا توجد مفضلات', wishlist_empty_sub: 'انقر على ♡ في صفحة النبات لإضافته هنا',
  wishlist_add_cart: 'أضف للسلة',

  profile_label: 'الحساب', profile_title: 'ملفي الشخصي',
  profile_first_name: 'الاسم الأول *', profile_last_name: 'اللقب *',
  profile_phone: 'الهاتف', profile_email: 'البريد الإلكتروني',
  profile_address: 'عنوان التوصيل', profile_save: 'حفظ التغييرات',
  profile_my_orders: 'طلباتي', profile_my_wishlist: 'مفضلتي',
  profile_modify: 'تعديل معلوماتي',
  profile_orders_sub: 'التتبع والسجل', profile_wishlist_sub: 'النباتات المحفوظة',

  auth_login_title: 'PlantVerde', auth_login_sub: 'سجّل دخولك إلى حسابك',
  auth_email: 'البريد الإلكتروني', auth_password: 'كلمة المرور',
  auth_login_btn: 'تسجيل الدخول', auth_no_account: 'ليس لديك حساب؟',
  auth_demo: 'حسابات تجريبية',
  auth_register_title: 'إنشاء حساب', auth_register_sub: 'انضم إلى مجتمع PlantVerde',
  auth_register_btn: 'إنشاء حسابي', auth_have_account: 'لديك حساب بالفعل؟',
  auth_password_min: 'الحد الأدنى 8 أحرف',

  admin_label: 'الإدارة', admin_dashboard: 'لوحة التحكم', admin_new_plant: 'نبات جديد',
  admin_revenue: 'إجمالي الإيرادات', admin_revenue_month: 'هذا الشهر',
  admin_pending_orders: 'الطلبات المعلقة', admin_to_process: 'ذات أولوية',
  admin_clients: 'العملاء المسجلون', admin_low_stock: 'مخزون منخفض',
  admin_low_stock_sub: 'أقل من 5 وحدات', admin_sales_chart: 'المبيعات — آخر 30 يومًا',
  admin_top_sales: '🏆 الأكثر مبيعًا', admin_no_sales: 'لا مبيعات',
  admin_alerts: '⚠️ تنبيهات المخزون المنخفض',
  admin_manage_plants: 'إدارة النباتات', admin_crud: 'إضافة/تعديل/حذف',
  admin_manage_orders: 'الطلبات', admin_manage_statuses: 'إدارة الحالات',
  admin_manage_users: 'المستخدمون', admin_manage_accounts: 'إدارة الحسابات',
  admin_quick_links: 'وصول سريع',

  admin_plants_label: 'الإدارة', admin_plants_title: 'إدارة النباتات',
  admin_plants_count: 'نبات في الكتالوج', admin_plant_name: 'الاسم *',
  admin_plant_species: 'النوع', admin_plant_category: 'الفئة *',
  admin_plant_price: 'السعر (دج) *', admin_plant_stock: 'المخزون *',
  admin_plant_difficulty: 'الصعوبة', admin_plant_status: 'الحالة',
  admin_plant_actions: 'الإجراءات', admin_plant_active: 'نشط', admin_plant_inactive: 'غير نشط',
  admin_plant_new: 'نبات جديد', admin_plant_edit: 'تعديل النبات',
  admin_plant_delete_confirm: 'حذف هذا النبات؟',
  admin_plant_watering: 'الري', admin_plant_light: 'الضوء',
  admin_plant_size: 'الحجم البالغ', admin_plant_discount: 'الخصم (%)',
  admin_plant_description: 'الوصف', admin_plant_image_url: 'رابط الصورة',
  admin_cancel: 'إلغاء', admin_create: 'إنشاء', admin_edit_btn: 'تحديث',

  admin_orders_label: 'الإدارة', admin_orders_title: 'إدارة الطلبات',
  admin_orders_id: '#', admin_orders_client: 'العميل', admin_orders_date: 'التاريخ',
  admin_orders_total: 'الإجمالي', admin_orders_status: 'الحالة', admin_orders_change: 'تغيير الحالة',
  admin_orders_items: 'المنتجات', admin_orders_delivery: 'التوصيل',
  admin_orders_confirm_btn: 'تأكيد', admin_orders_ship_btn: 'شحن',
  admin_orders_deliver_btn: 'تسليم', admin_orders_cancel_btn: 'إلغاء',
  admin_orders_none: 'لا توجد طلبات',

  admin_users_label: 'الإدارة', admin_users_title: 'إدارة المستخدمين',
  admin_users_count: 'حساب مسجل', admin_users_user: 'المستخدم',
  admin_users_email: 'البريد', admin_users_phone: 'الهاتف', admin_users_role: 'الدور',
  admin_users_status: 'الحالة', admin_users_joined: 'تاريخ الانضمام', admin_users_actions: 'الإجراءات',
  admin_users_active: 'نشط', admin_users_disabled: 'معطّل',
  admin_users_protected: 'محمي', admin_users_none: 'لا مستخدمين',
  admin_users_create: 'إنشاء حساب', admin_users_create_title: 'مستخدم جديد',
  admin_users_role_admin: 'مدير', admin_users_role_client: 'عميل',

  review_title: 'تقييمات العملاء', review_sub: 'ماذا يقول عملاؤنا',
  review_write: 'تقييم الخدمة', review_edit: 'تعديل تقييمي',
  review_your_rating: 'تقييمك', review_service: 'خدمة العملاء',
  review_delivery: 'التوصيل', review_quality: 'جودة النباتات',
  review_overall: 'الانطباع العام', review_comment_ph: 'شارك تجربتك...',
  review_submit: 'نشر تقييمي', review_update: 'تحديث',
  review_cancel: 'إلغاء', review_success: 'شكرًا على تقييمك!',
  review_already: 'لقد قمت بتقييم هذه الخدمة مسبقًا.',
  review_login_required: 'سجّل دخولك للتقييم',
  review_based_on: 'بناءً على', review_ratings: 'تقييم', review_no_reviews: 'لا توجد تقييمات بعد',
  review_verified: 'شراء موثق', review_label: '⭐ تقييمات', review_avg: 'متوسط التقييم',
  review_rating_1: 'سيء جداً', review_rating_2: 'سيء', review_rating_3: 'مقبول',
  review_rating_4: 'جيد', review_rating_5: 'ممتاز',
  review_select_rating: 'اختر تقييماً', review_deleted: 'تم حذف التقييم',
  page_prev: 'السابق ←', page_next: '→ التالي', page_number: 'صفحة',
  footer_nav: 'التنقل', footer_contact: 'التواصل',
  footer_delivery: '🌍 الجزائر', footer_payment: '✅ الدفع عند الاستلام',
  footer_hours: 'الإثنين–السبت: 8ص–6م', footer_rights: 'جميع الحقوق محفوظة.',
};

const LANGS: Record<Lang, Translations> = { fr: FR, ar: AR };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly STORAGE_KEY = 'pv_lang';

  currentLang = signal<Lang>(this.loadLang());
  t = signal<Translations>(LANGS[this.loadLang()]);

  isRtl = () => this.currentLang() === 'ar';

  constructor() {
    effect(() => {
      const lang = this.currentLang();
      this.t.set(LANGS[lang]);
      document.documentElement.lang = lang;
      document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.style.setProperty(
        '--pv-font',
        lang === 'ar' ? "'Cairo', 'Noto Sans Arabic', sans-serif" : "'Plus Jakarta Sans', sans-serif"
      );
      localStorage.setItem(this.STORAGE_KEY, lang);
    });
  }

  setLang(lang: Lang): void {
    this.currentLang.set(lang);
  }

  private loadLang(): Lang {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Lang;
    return saved && ['fr','ar'].includes(saved) ? saved : 'fr';
  }
}
