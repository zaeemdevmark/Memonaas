export interface ReviewUser {
  id:   string;
  name: string;
}

export interface ReviewDTO {
  id:         string;
  rating:     number;
  title:      string | null;
  body:       string | null;
  isVerified: boolean;
  isApproved: boolean;
  productId:  string;
  user:       ReviewUser;
  createdAt:  string;
  updatedAt:  string;
}

export interface AdminReviewDTO extends ReviewDTO {
  product: { id: string; name: string; slug: string };
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ReviewSummary {
  averageRating:   number | null;
  totalReviews:    number;
  approvedReviews: number;
  distribution:    RatingDistribution;
}

export interface ProductReviewsResult {
  reviews:         ReviewDTO[];
  summary:         ReviewSummary;
  userReview:      ReviewDTO | null;
  isAuthenticated: boolean;
  total:           number;
  page:            number;
  totalPages:      number;
}

export interface AdminReviewsResult {
  reviews: AdminReviewDTO[];
  total:   number;
  page:    number;
  totalPages: number;
}
