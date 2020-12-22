import "reflect-metadata";
import app from "./app";
const PORT = 3000;

app.listen(PORT, () => {
  console.info(`server listening on localhost:${PORT}`);
});
