import { TutorProfile } from '../models/TutorProfile.js';

/**
 * Intelligent Matching Algorithm for Parents and Tutors
 * Applies hard filters first (Subject, Class, Teaching Mode),
 * then calculates a multi-factor compatibility score (0-100%).
 */
export const findMatchingTutors = async (requirement) => {
  const {
    subjects,
    classGrade,
    teachingMode,
    budget,
    location,
    tutorPreferences
  } = requirement;

  // 1. Hard Requirements Query
  const query = {
    isPublished: true,
    isAcceptingStudents: true
  };

  // Subject matching (at least one subject must match)
  if (subjects && subjects.length > 0) {
    query.subjects = { $in: subjects };
  }

  // Class / Learning level matching
  if (classGrade) {
    query.classes = classGrade;
  }

  // Teaching Mode matching
  if (teachingMode) {
    query.teachingModes = teachingMode;
  }

  const potentialTutors = await TutorProfile.find(query).populate('user', 'name email phone avatar isEmailVerified isPhoneVerified');

  // 2. Score and Rank Compatible Tutors
  const scoredTutors = potentialTutors.map(tutor => {
    let score = 40; // Base score for satisfying hard requirements
    const matchFactors = [];
    let budgetMismatch = false;

    // A. Locality / Proximity Matching
    if (teachingMode === 'student_home') {
      const parentLocality = location?.locality || '';
      const tutorPreferred = tutor.homeTuitionDetails?.preferredLocalities || [];
      const isLocalityMatch = tutorPreferred.some(loc => 
        loc.toLowerCase().includes(parentLocality.toLowerCase()) || 
        parentLocality.toLowerCase().includes(loc.toLowerCase())
      );

      if (isLocalityMatch) {
        score += 20;
        matchFactors.push(`Serves your locality (${parentLocality})`);
      } else {
        matchFactors.push(`May travel within ${tutor.homeTuitionDetails?.maxTravelDistanceKm || 5} km`);
      }
    } else if (teachingMode === 'tutor_centre') {
      const centreLocality = tutor.centreDetails?.locality || '';
      matchFactors.push(`Centre located in ${centreLocality || tutor.primaryLocality}`);
      score += 15;
    } else {
      score += 15; // Online mode has high availability flexibility
      matchFactors.push('Available for interactive online tuition');
    }

    // B. Budget Compatibility
    const tutorRate = tutor.feeStructure?.hourlyRate || 0;
    const maxBudget = budget?.maxBudget || 1000;
    if (tutorRate <= maxBudget) {
      score += 15;
      matchFactors.push(`Within your budget (₹${tutorRate}/hr vs max ₹${maxBudget}/hr)`);
    } else {
      budgetMismatch = true;
      matchFactors.push(`Fee (₹${tutorRate}/hr) exceeds your budget (₹${maxBudget}/hr)`);
    }

    // C. Qualifications & Verifications
    if (tutor.verificationBadges?.qualificationVerified) {
      score += 10;
      matchFactors.push('Verified degree and qualifications');
    }
    if (tutor.verificationBadges?.backgroundChecked) {
      score += 5;
      matchFactors.push('Background check verified');
    }

    // D. Experience
    const minExp = tutorPreferences?.minExperienceYears || 0;
    if (tutor.yearsOfExperience >= minExp) {
      score += 5;
      matchFactors.push(`${tutor.yearsOfExperience}+ years teaching experience`);
    }

    // E. Ratings
    if (tutor.averageRating >= 4.5 && tutor.reviewCount > 0) {
      score += 5;
      matchFactors.push(`Top rated (${tutor.averageRating.toFixed(1)} ★ from ${tutor.reviewCount} reviews)`);
    }

    // Cap score at 100
    const finalScore = Math.min(Math.round(score), 100);

    return {
      tutor,
      compatibilityScore: finalScore,
      budgetMismatch,
      matchFactors
    };
  });

  // Sort by compatibility score descending
  scoredTutors.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return scoredTutors;
};
