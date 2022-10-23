import { RATING_SCORE } from '../configs/variables';
import { Ratings } from '../types/apiResults';

const getRatings = (ratings: Ratings) => {
  let hostRating = 0;
  let proxyRating = 0;

  hostRating += ratings.hostedClassCounter * RATING_SCORE.hostOpenClass;
  hostRating += ratings.completedClassCounter * RATING_SCORE.hostCompletedClass;
  hostRating += ratings.cancelledClassCounter * RATING_SCORE.hostCancelledClass;
  hostRating += ratings.satisfiedHostReviewCounter * RATING_SCORE.reviewGood;
  hostRating += (ratings.receivedHostReviewCounter - ratings.satisfiedHostReviewCounter) * RATING_SCORE.reviewBad;
  proxyRating += ratings.proxiedClassCounter * RATING_SCORE.proxyCompletedClass;
  proxyRating += ratings.satisfiedProxyReviewCounter * RATING_SCORE.reviewGood;
  proxyRating += (ratings.receivedProxyReviewCounter - ratings.satisfiedProxyReviewCounter) * RATING_SCORE.reviewBad;
  let satisfactionRate =
    ratings.receivedHostReviewCounter + ratings.receivedProxyReviewCounter === 0
      ? 0
      : Math.round(
          ((ratings.satisfiedProxyReviewCounter + ratings.satisfiedHostReviewCounter) /
            (ratings.receivedHostReviewCounter + ratings.receivedProxyReviewCounter)) *
            100,
        );
  let hostSatisfactionRate =
    ratings.receivedHostReviewCounter === 0
      ? 0
      : Math.round((ratings.satisfiedHostReviewCounter / ratings.receivedHostReviewCounter) * 100);
  let proxySatisfactionRate =
    ratings.receivedProxyReviewCounter === 0
      ? 0
      : Math.round((ratings.satisfiedProxyReviewCounter / ratings.receivedProxyReviewCounter) * 100);

  let totalRating = hostRating + proxyRating;

  return { totalRating, hostRating, proxyRating, satisfactionRate, hostSatisfactionRate, proxySatisfactionRate };
};

export default getRatings;
