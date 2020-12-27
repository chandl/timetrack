db.createUser({
  user: "timetrack",
  pwd: "timetrack",
  roles: [
    {
      role: "readWrite",
      db: "timetrack",
    },
  ],
});
