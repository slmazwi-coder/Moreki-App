export const createPageUrl = (page) => {
    const routes = {
      "ShoppingList": "/shopping-list",
      "HowItWorks": "/how-it-works",
      "Home": "/"
    };
    return routes[page] || "/";
  };
  