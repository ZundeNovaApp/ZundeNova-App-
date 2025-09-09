import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, TextInput } from 'react-native';

interface OnboardingData {
  userType: 'farmer' | 'vet' | 'ngo' | 'coop' | 'investor';
  language: string;
  location: string;
  farmSize?: number;
  cropTypes?: string[];
  livestockTypes?: string[];
  experience: 'beginner' | 'intermediate' | 'expert';
  interests: string[];
}

interface OnboardingSplashScreenProps {
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingSplashScreen({ onComplete }: OnboardingSplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    interests: []
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'am', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' }
  ];

  const userTypes = [
    { 
      type: 'farmer', 
      title: 'Farmer', 
      icon: '🌾', 
      description: 'Grow crops, raise livestock, manage your farm',
      color: '#00684b'
    },
    { 
      type: 'vet', 
      title: 'Veterinarian', 
      icon: '🩺', 
      description: 'Provide animal health services and consultations',
      color: '#007f82'
    },
    { 
      type: 'ngo', 
      title: 'NGO/Government', 
      icon: '🏛️', 
      description: 'Support agricultural development and policy',
      color: '#dbc600'
    },
    { 
      type: 'coop', 
      title: 'Cooperative', 
      icon: '🤝', 
      description: 'Manage group buying, selling, and farmer support',
      color: '#00684b'
    },
    { 
      type: 'investor', 
      title: 'Investor/Partner', 
      icon: '💼', 
      description: 'Track impact, monitor investments, view analytics',
      color: '#007f82'
    }
  ];

  const cropTypes = [
    'Maize', 'Rice', 'Wheat', 'Beans', 'Tomatoes', 'Onions', 
    'Potatoes', 'Cassava', 'Sweet Potatoes', 'Bananas', 'Coffee', 'Tea'
  ];

  const livestockTypes = [
    'Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs', 'Fish', 'Rabbits'
  ];

  const interests = [
    'Crop Management', 'Livestock Care', 'Market Access', 'Financial Services',
    'Weather Monitoring', 'Pest Control', 'Soil Health', 'Irrigation',
    'Organic Farming', 'Technology Adoption', 'Community Building', 'Education'
  ];

  const onboardingSteps = [
    {
      title: 'Choose Your Language',
      subtitle: 'Select your preferred language',
      component: 'language'
    },
    {
      title: 'What describes you best?',
      subtitle: 'Select your primary role',
      component: 'userType'
    },
    {
      title: 'Where are you located?',
      subtitle: 'Help us provide localized services',
      component: 'location'
    },
    {
      title: 'Tell us about your experience',
      subtitle: 'This helps us customize your experience',
      component: 'experience'
    },
    {
      title: 'What interests you most?',
      subtitle: 'Select areas you want to focus on',
      component: 'interests'
    }
  ];

  useEffect(() => {
    startAnimations();
  }, [currentStep]);

  const startAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(onboardingData as OnboardingData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateOnboardingData = (key: string, value: any) => {
    setOnboardingData(prev => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = onboardingData.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    updateOnboardingData('interests', updatedInterests);
  };

  const renderLanguageSelection = () => (
    <ScrollView style={styles.optionsContainer}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.optionCard,
            onboardingData.language === lang.code && styles.optionCardSelected
          ]}
          onPress={() => updateOnboardingData('language', lang.code)}
        >
          <Text style={styles.optionFlag}>{lang.flag}</Text>
          <Text style={[
            styles.optionText,
            onboardingData.language === lang.code && styles.optionTextSelected
          ]}>
            {lang.name}
          </Text>
          {onboardingData.language === lang.code && (
            <Text style={{ color: '#dbc600', fontSize: 24 }}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderUserTypeSelection = () => (
    <ScrollView style={styles.optionsContainer}>
      {userTypes.map((type) => (
        <TouchableOpacity
          key={type.type}
          style={[
            styles.userTypeCard,
            onboardingData.userType === type.type && styles.userTypeCardSelected
          ]}
          onPress={() => updateOnboardingData('userType', type.type)}
        >
          <View style={styles.userTypeHeader}>
            <Text style={styles.userTypeIcon}>{type.icon}</Text>
            <View style={styles.userTypeInfo}>
              <Text style={[
                styles.userTypeTitle,
                onboardingData.userType === type.type && styles.userTypeTextSelected
              ]}>
                {type.title}
              </Text>
              <Text style={[
                styles.userTypeDescription,
                onboardingData.userType === type.type && styles.userTypeDescriptionSelected
              ]}>
                {type.description}
              </Text>
            </View>
          </View>
          {onboardingData.userType === type.type && (
            <Text style={{ color: '#dbc600', fontSize: 24 }}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderLocationInput = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="Enter your location (e.g., Nairobi, Kenya)"
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        value={onboardingData.location || ''}
        onChangeText={(text) => updateOnboardingData('location', text)}
      />
      
      {onboardingData.userType === 'farmer' && (
        <>
          <Text style={styles.inputLabel}>Farm Size (hectares)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter farm size"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            keyboardType="numeric"
            value={onboardingData.farmSize?.toString() || ''}
            onChangeText={(text) => updateOnboardingData('farmSize', parseFloat(text) || 0)}
          />
          
          <Text style={styles.inputLabel}>Crop Types (select multiple)</Text>
          <ScrollView horizontal style={styles.tagContainer}>
            {cropTypes.map((crop) => (
              <TouchableOpacity
                key={crop}
                style={[
                  styles.tag,
                  onboardingData.cropTypes?.includes(crop) && styles.tagSelected
                ]}
                onPress={() => {
                  const current = onboardingData.cropTypes || [];
                  const updated = current.includes(crop)
                    ? current.filter(c => c !== crop)
                    : [...current, crop];
                  updateOnboardingData('cropTypes', updated);
                }}
              >
                <Text style={[
                  styles.tagText,
                  onboardingData.cropTypes?.includes(crop) && styles.tagTextSelected
                ]}>
                  {crop}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.inputLabel}>Livestock Types (select multiple)</Text>
          <ScrollView horizontal style={styles.tagContainer}>
            {livestockTypes.map((livestock) => (
              <TouchableOpacity
                key={livestock}
                style={[
                  styles.tag,
                  onboardingData.livestockTypes?.includes(livestock) && styles.tagSelected
                ]}
                onPress={() => {
                  const current = onboardingData.livestockTypes || [];
                  const updated = current.includes(livestock)
                    ? current.filter(l => l !== livestock)
                    : [...current, livestock];
                  updateOnboardingData('livestockTypes', updated);
                }}
              >
                <Text style={[
                  styles.tagText,
                  onboardingData.livestockTypes?.includes(livestock) && styles.tagTextSelected
                ]}>
                  {livestock}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );

  const renderExperienceSelection = () => (
    <View style={styles.optionsContainer}>
      {[
        { level: 'beginner', title: 'Beginner', description: 'New to farming or your role', icon: '🌱' },
        { level: 'intermediate', title: 'Intermediate', description: 'Some experience, looking to improve', icon: '🌿' },
        { level: 'expert', title: 'Expert', description: 'Experienced, want advanced features', icon: '🌳' }
      ].map((exp) => (
        <TouchableOpacity
          key={exp.level}
          style={[
            styles.experienceCard,
            onboardingData.experience === exp.level && styles.experienceCardSelected
          ]}
          onPress={() => updateOnboardingData('experience', exp.level)}
        >
          <Text style={styles.experienceIcon}>{exp.icon}</Text>
          <View style={styles.experienceInfo}>
            <Text style={[
              styles.experienceTitle,
              onboardingData.experience === exp.level && styles.experienceTextSelected
            ]}>
              {exp.title}
            </Text>
            <Text style={[
              styles.experienceDescription,
              onboardingData.experience === exp.level && styles.experienceDescriptionSelected
            ]}>
              {exp.description}
            </Text>
          </View>
          {onboardingData.experience === exp.level && (
            <Text style={{ color: '#dbc600', fontSize: 24 }}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInterestsSelection = () => (
    <ScrollView style={styles.interestsContainer}>
      <View style={styles.interestsGrid}>
        {interests.map((interest) => (
          <TouchableOpacity
            key={interest}
            style={[
              styles.interestCard,
              onboardingData.interests?.includes(interest) && styles.interestCardSelected
            ]}
            onPress={() => toggleInterest(interest)}
          >
            <Text style={[
              styles.interestText,
              onboardingData.interests?.includes(interest) && styles.interestTextSelected
            ]}>
              {interest}
            </Text>
            {onboardingData.interests?.includes(interest) && (
              <Text style={[styles.interestCheck, { color: '#dbc600', fontSize: 20 }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    const step = onboardingSteps[currentStep];
    
    switch (step.component) {
      case 'language':
        return renderLanguageSelection();
      case 'userType':
        return renderUserTypeSelection();
      case 'location':
        return renderLocationInput();
      case 'experience':
        return renderExperienceSelection();
      case 'interests':
        return renderInterestsSelection();
      default:
        return null;
    }
  };

  const isStepValid = () => {
    const step = onboardingSteps[currentStep];
    
    switch (step.component) {
      case 'language':
        return !!onboardingData.language;
      case 'userType':
        return !!onboardingData.userType;
      case 'location':
        return !!onboardingData.location;
      case 'experience':
        return !!onboardingData.experience;
      case 'interests':
        return (onboardingData.interests?.length || 0) > 0;
      default:
        return true;
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View
      style={[styles.container, { backgroundColor: '#00684b' }]}
    >
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>

      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.stepTitle}>{currentStepData.title}</Text>
        <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {renderStepContent()}
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.backButton]}
          onPress={handleBack}
          disabled={currentStep === 0}
        >
          <Text style={{ color: currentStep === 0 ? 'rgba(255,255,255,0.3)' : 'white', fontSize: 20 }}>←</Text>
          <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.nextButton,
            !isStepValid() && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isStepValid()}
        >
          <Text style={styles.navButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Complete' : 'Next'}
          </Text>
          <Text style={{ color: 'white', fontSize: 20 }}>
            {currentStep === onboardingSteps.length - 1 ? "✓" : "→"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#dbc600',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  headerContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#dbc600',
  },
  optionFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  optionTextSelected: {
    fontWeight: 'bold',
  },
  userTypeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userTypeCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#dbc600',
  },
  userTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTypeIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  userTypeInfo: {
    flex: 1,
  },
  userTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userTypeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userTypeTextSelected: {
    color: '#dbc600',
  },
  userTypeDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    marginTop: 20,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagContainer: {
    marginBottom: 15,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagSelected: {
    backgroundColor: '#dbc600',
    borderColor: '#dbc600',
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#00684b',
    fontWeight: 'bold',
  },
  experienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  experienceCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#dbc600',
  },
  experienceIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  experienceInfo: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  experienceDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  experienceTextSelected: {
    color: '#dbc600',
  },
  experienceDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  interestsContainer: {
    flex: 1,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interestCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  interestCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#dbc600',
  },
  interestText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  interestTextSelected: {
    color: '#dbc600',
    fontWeight: 'bold',
  },
  interestCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextButton: {
    backgroundColor: '#dbc600',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginHorizontal: 5,
  },
  navButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
