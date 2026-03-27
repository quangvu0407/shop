export const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_my_orders",
      description: "Get the list of orders for the current user. Use when user asks about orders, order status, or purchase history.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search for products by name or category. ALWAYS use short, simple English keywords (1-3 words max). E.g. 'jeans', 'dress', 't-shirt', 'top', 'jacket', 'cotton top'.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Short English keyword, 1-3 words only. Example: 'jeans', 'cotton top', 'dress'" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description: "Place a COD order. Only call when you have all required info: product list and delivery address.",
      parameters: {
        type: "object",
        properties: {
          items_json: {
            type: "string",
            description: 'JSON array string of items. Example: [{"productId":"abc","name":"Quần jeans","price":299000,"size":"L","quantity":1}]'
          },
          firstName: { type: "string", description: "Customer first name" },
          lastName: { type: "string", description: "Customer last name" },
          street: { type: "string", description: "Street address" },
          city: { type: "string", description: "City" },
          phone: { type: "string", description: "Phone number" }
        },
        required: ["items_json", "firstName", "lastName", "street", "city", "phone"]
      }
    }
  }
];
