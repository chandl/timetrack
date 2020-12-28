const API = process.env.REACT_APP_API || "http://localhost:3000";

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
          return [null, null];
        }
        if (!response.ok) {
          throw new Error(
            `Encountered error making request to server; Error=${text}; Status=${response.statusText}. Send this error to chandler so he can fix 😎`
          );
        }
        return [JSON.parse(text), null];
      } catch (error) {
        console.error(error);
        return [null, error];
      }
}


export {Fetch};