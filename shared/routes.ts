export const API_ROUTES = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
  },
  returns: {
    list: "/api/returns",
    create: "/api/returns",
    get: (id: number) => `/api/returns/${id}`,
    delete: (id: number) => `/api/returns/${id}`,
    w2: {
      list: (returnId: number) => `/api/returns/${returnId}/w2`,
      create: (returnId: number) => `/api/returns/${returnId}/w2`,
      update: (returnId: number, docId: string) => `/api/returns/${returnId}/w2/${docId}`,
      delete: (returnId: number, docId: string) => `/api/returns/${returnId}/w2/${docId}`,
    },
  },
};
