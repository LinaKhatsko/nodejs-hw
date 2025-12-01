// Ця функція спрацює, якщо запит не "спіймав" жоден
// з маршрутів
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
};
