export const questionForm = {
  uk: {
    required: 'Це поле обовʼязкове',
    title: 'Залишились питання?',
    text: 'Вкажіть номер телефону, і ми вам передзвонимо',
    policy: (
      <>
        Натискаючи кнопку, ви погоджуєтесь з умовами <br />
        обробки персональних даних.
      </>
    ),
    namePlaceholder: 'ПІБ пацієнта',
    phonePlaceholder: 'Ваш номер телефону*',
    messagePlaceholder: 'Чим ми можемо вам допомогти?',
    submit: 'Відправити',
    success: 'Дякуємо! Ми отримали вашу заявку і скоро звʼяжемося з вами.',
    error: 'Не вдалося відправити заявку. Спробуйте ще раз або звʼяжіться з нами телефоном.',
    sending: 'Відправляємо...',
  },
  ru: {
    required: 'Это поле обязательно',
    title: 'Остались вопросы?',
    text: 'Укажите номер телефона, и мы вам перезвоним',
    policy: <>Нажимая на кнопку, вы соглашаетесь с условиями обработки персональных данных.</>,
    namePlaceholder: 'ФИО пациента',
    phonePlaceholder: 'Ваш номер телефона*',
    messagePlaceholder: 'Чем мы можем вам помочь?',
    submit: 'Отправить',
    success: 'Спасибо! Мы получили вашу заявку и скоро свяжемся с вами.',
    error: 'Не удалось отправить заявку. Попробуйте еще раз или свяжитесь с нами по телефону.',
    sending: 'Отправляем...',
  },
  en: {
    required: 'This field is required',
    title: 'Have questions?',
    text: 'Please provide your phone number, and we will call you back',
    policy: <>By clicking the button, you agree to the terms of personal data processing.</>,
    namePlaceholder: "Patient's full name",
    phonePlaceholder: 'Your phone number*',
    messagePlaceholder: 'How can we assist you?',
    submit: 'Submit',
    success: 'Thank you! We have received your request and will contact you soon.',
    error: 'Could not send the request. Please try again or contact us by phone.',
    sending: 'Sending...',
  },
}

export const callbackWidget = {
  uk: {
    aria: 'Замовити зворотний дзвінок',
    close: 'Закрити форму',
    title: 'Передзвонити вам?',
    text: 'Залиште номер — адміністратор передзвонить у робочі години.',
    submit: 'Передзвоніть мені',
    invalidPhone: 'Вкажіть коректний номер телефону',
    serverMessage: 'Заявка на зворотний дзвінок (віджет)',
  },
  ru: {
    aria: 'Заказать обратный звонок',
    close: 'Закрыть форму',
    title: 'Перезвонить вам?',
    text: 'Оставьте номер — администратор перезвонит в рабочие часы.',
    submit: 'Перезвоните мне',
    invalidPhone: 'Укажите корректный номер телефона',
    serverMessage: 'Заявка на обратный звонок (виджет)',
  },
  en: {
    aria: 'Request a callback',
    close: 'Close the form',
    title: 'Shall we call you back?',
    text: 'Leave your number and our administrator will call during working hours.',
    submit: 'Call me back',
    invalidPhone: 'Please enter a valid phone number',
    serverMessage: 'Callback request (widget)',
  },
}
