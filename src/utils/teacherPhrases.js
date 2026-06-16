const CORRECT_PHRASES = ['Молодец!', 'Отличная работа!', 'Верно!', 'Так держать!', 'Умница!']
const WRONG_PHRASES = ['Неправильно', 'Подумай ещё', 'Почти...', 'Ошибка', 'Попробуй внимательнее']
const TIMEOUT_PHRASES = ['Время вышло', 'Нужно быстрее', 'Тик-так...']

export function getTeacherPhrase(isCorrect, timedOut = false) {
  if (timedOut) {
    return TIMEOUT_PHRASES[Math.floor(Math.random() * TIMEOUT_PHRASES.length)]
  }
  const list = isCorrect ? CORRECT_PHRASES : WRONG_PHRASES
  return list[Math.floor(Math.random() * list.length)]
}
