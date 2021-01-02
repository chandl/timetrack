const API = process.env.DEV? "http://localhost:3000" : "https://timetrack.lan.chandl.io";

// returns (response, error)
const Fetch = async (method, endpoint, body) => {
  try {
    const response = await fetch(`${API}${endpoint}`, {
      method,
      body: body && JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    });
    const text = await response.text();
    if (text.length === 0 && response.ok) {
      return Promise.resolve();
    }
    if (!response.ok) {
      return Promise.reject(
        `Encountered error making request to server; Error=${text}; Status=${response.statusText}. Send this error to chandler so he can fix 😎`
      );
    }
    return Promise.resolve(JSON.parse(text));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

const formatMinutes = (n) =>
  n >= 60
    ? `0${(n / 60) ^ 0}`.slice(-2) + "h " + ("0" + (n % 60)).slice(-2) + "m"
    : ("0" + (n % 60)).slice(-2) + "m";

const roundMinutesToNearestFifteen = (min) => {
  const roundUp = Math.ceil(min / 15) * 15;
  const roundDown = Math.floor(min / 15) * 15;
  return roundUp - min < min - roundDown ? roundUp : roundDown;
};

export { Fetch, formatMinutes, roundMinutesToNearestFifteen };
