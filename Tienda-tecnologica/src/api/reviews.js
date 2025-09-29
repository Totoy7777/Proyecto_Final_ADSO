import api from "./axios";

const authConfig = (authHeader) =>
  authHeader
    ? {
        headers: {
          Authorization: authHeader,
        },
      }
    : {};

export const getReviews = (productId) =>
  api.get(`/products/${productId}/reviews`).then((res) => res.data);

export const createReview = (productId, payload, authHeader) =>
  api
    .post(`/products/${productId}/reviews`, payload, authConfig(authHeader))
    .then((res) => res.data);

export const respondReview = (productId, reviewId, payload, authHeader) =>
  api
    .patch(
      `/products/${productId}/reviews/${reviewId}/response`,
      payload,
      authConfig(authHeader)
    )
    .then((res) => res.data);

export const removeReview = (productId, reviewId, authHeader) =>
  api.delete(
    `/products/${productId}/reviews/${reviewId}`,
    authConfig(authHeader)
  );
