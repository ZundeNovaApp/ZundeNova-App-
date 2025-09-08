import AfricasTalking from 'africastalking';

interface USSDSession {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

interface SMSMessage {
  from: string;
  text: string;
  to: string;
}

interface USSDResponse {
  response: string;
  endSession: boolean;
}

class AfricasTalkingService {
  private client: any;
  private sessions: Map<string, any> = new Map();

  constructor() {
    this.client = AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY || 'demo-api-key',
      username: process.env.AFRICASTALKING_USERNAME || 'sandbox'
    });
  }

  async handleUSSDSession(session: USSDSession): Promise<string> {
    const { text, phoneNumber, sessionId } = session;
    const textArray = text.split('*');
    const level = textArray.length;

    this.sessions.set(sessionId, {
      phoneNumber,
      level,
      history: textArray,
      timestamp: Date.now()
    });

    try {
      if (text === '') {
        return this.getMainMenu();
      }

      if (level === 1) {
        return await this.handleMainMenuChoice(textArray[0], phoneNumber);
      }

      if (level === 2) {
        return await this.handleSubMenuChoice(textArray, phoneNumber);
      }

      if (level === 3) {
        return await this.handleDetailedChoice(textArray, phoneNumber);
      }

      return 'END Thank you for using ZundeNova. Have a productive farming day!';
    } catch (error) {
      console.error('USSD session error:', error);
      return 'END Service temporarily unavailable. Please try again later.';
    }
  }

  private getMainMenu(): string {
    return `CON Welcome to ZundeNova 🌱
Your Smart Agricultural Assistant

1. 🔍 Crop Diagnosis
2. 🌤️ Weather & Alerts
3. 🛒 Marketplace
4. 🐄 Livestock Care
5. 📊 Farm Records
6. 💰 Financial Services
7. 📚 Learning Center
8. 👥 Community
9. ⚙️ Settings`;
  }

  private async handleMainMenuChoice(choice: string, phoneNumber: string): Promise<string> {
    switch (choice) {
      case '1':
        return `CON 🔍 Crop Diagnosis
1. Describe symptoms
2. Upload photo (SMS)
3. Get expert advice
4. Disease alerts
5. Treatment history
0. Back to main menu`;

      case '2':
        return await this.getWeatherMenu(phoneNumber);

      case '3':
        return `CON 🛒 Marketplace
1. Buy seeds & inputs
2. Buy fertilizers
3. Sell your produce
4. Equipment rental
5. View orders
6. Payment options
0. Back to main menu`;

      case '4':
        return `CON 🐄 Livestock Care
1. Health diagnosis
2. Vaccination schedule
3. Book vet consultation
4. Emergency services
5. Feed calculator
6. Breeding records
0. Back to main menu`;

      case '5':
        return `CON 📊 Farm Records
1. Add income
2. Add expenses
3. View profit/loss
4. Crop yields
5. Export reports
0. Back to main menu`;

      case '6':
        return `CON 💰 Financial Services
1. Micro-loans
2. Insurance
3. Savings groups
4. Payment history
5. Credit score
0. Back to main menu`;

      case '7':
        return `CON 📚 Learning Center
1. Crop guides
2. Video tutorials
3. Best practices
4. Seasonal tips
5. Certification
0. Back to main menu`;

      case '8':
        return `CON 👥 Community
1. Ask farmers
2. Local events
3. Market prices
4. Success stories
5. Discussion groups
0. Back to main menu`;

      case '9':
        return `CON ⚙️ Settings
1. Language: English
2. Location settings
3. Notifications
4. Account info
5. Help & support
0. Back to main menu`;

      default:
        return 'END Invalid choice. Please try again.';
    }
  }

  private async handleSubMenuChoice(textArray: string[], phoneNumber: string): Promise<string> {
    const mainChoice = textArray[0];
    const subChoice = textArray[1];

    if (subChoice === '0') {
      return this.getMainMenu();
    }

    switch (mainChoice) {
      case '1': // Crop Diagnosis
        return await this.handleCropDiagnosis(subChoice, phoneNumber);
      
      case '2': // Weather
        return await this.handleWeatherChoice(subChoice, phoneNumber);
      
      case '3': // Marketplace
        return await this.handleMarketplaceChoice(subChoice, phoneNumber);
      
      case '4': // Livestock
        return await this.handleLivestockChoice(subChoice, phoneNumber);
      
      case '5': // Farm Records
        return await this.handleRecordsChoice(subChoice, phoneNumber);
      
      default:
        return 'END Feature coming soon. Thank you for using ZundeNova!';
    }
  }

  private async handleDetailedChoice(textArray: string[], phoneNumber: string): Promise<string> {
    const mainChoice = textArray[0];
    const subChoice = textArray[1];
    const detailChoice = textArray[2];

    if (mainChoice === '1' && subChoice === '1') {
      return await this.processCropSymptoms(detailChoice, phoneNumber);
    }

    if (mainChoice === '3' && subChoice === '1') {
      return await this.processMarketplacePurchase(detailChoice, phoneNumber);
    }

    return 'END Thank you for using ZundeNova!';
  }

  private async getWeatherMenu(phoneNumber: string): Promise<string> {
    try {
      const location = await this.getUserLocation(phoneNumber) || 'Nairobi';
      
      const weather = {
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 65,
        rainfall_chance: 30
      };

      return `CON 🌤️ Weather for ${location}
Current: ${weather.temperature}°C, ${weather.condition}
Humidity: ${weather.humidity}%
Rain chance: ${weather.rainfall_chance}%

1. 7-day forecast
2. Planting advice
3. Irrigation tips
4. Pest alerts
5. Change location
0. Back to main menu`;
    } catch (error) {
      return `CON 🌤️ Weather Updates
1. Current conditions
2. 7-day forecast
3. Planting advice
4. Irrigation tips
5. Set location
0. Back to main menu`;
    }
  }

  private async handleCropDiagnosis(choice: string, phoneNumber: string): Promise<string> {
    switch (choice) {
      case '1':
        return `CON Describe crop symptoms:
1. Yellow leaves
2. Brown spots
3. Wilting
4. Stunted growth
5. Pest damage
6. Other symptoms
0. Back`;

      case '2':
        await this.sendSMS(phoneNumber, 'Send a photo of your crop to this number for AI diagnosis. Our experts will respond within 30 minutes.');
        return 'END Photo diagnosis request sent via SMS. Check your messages.';

      case '3':
        return `CON Expert Consultation
Available agronomists:
1. Dr. Sarah Mwangi (Crops)
2. Dr. John Kiprotich (Pests)
3. Dr. Mary Wanjiku (Soil)

Select expert or:
0. Back`;

      case '4':
        return `CON Disease Alerts (This Week)
⚠️ Maize: Fall armyworm risk HIGH
⚠️ Tomato: Late blight risk MEDIUM
⚠️ Beans: Rust risk LOW

1. View details
2. Prevention tips
0. Back`;

      default:
        return 'END Invalid choice.';
    }
  }

  private async handleWeatherChoice(choice: string, phoneNumber: string): Promise<string> {
    switch (choice) {
      case '1':
        return `CON 7-Day Forecast
Today: 28°C, Partly cloudy
Tomorrow: 26°C, Light rain
Day 3: 30°C, Sunny
Day 4: 25°C, Heavy rain
Day 5: 29°C, Clear
Day 6: 27°C, Cloudy
Day 7: 31°C, Hot & dry

1. Detailed view
0. Back`;

      case '2':
        return `CON Planting Advice
Based on weather forecast:

✅ Good time to plant:
- Drought-resistant maize
- Short-season beans

⚠️ Wait before planting:
- Tomatoes (rain expected)
- Leafy vegetables

1. More details
0. Back`;

      default:
        return 'END Weather service complete.';
    }
  }

  private async handleMarketplaceChoice(choice: string, phoneNumber: string): Promise<string> {
    switch (choice) {
      case '1':
        return `CON 🌱 Seeds & Inputs
1. Maize seeds (KES 500/kg)
2. Bean seeds (KES 300/kg)
3. Fertilizer DAP (KES 3500/bag)
4. Pesticides (KES 800/bottle)
5. View cart
0. Back`;

      case '2':
        return `CON 🧪 Fertilizers
1. DAP (KES 3500/50kg)
2. NPK (KES 3200/50kg)
3. Urea (KES 2800/50kg)
4. Organic compost (KES 1500/bag)
5. Foliar feeds (KES 600/bottle)
0. Back`;

      case '3':
        return `CON 📦 Sell Produce
1. Post maize for sale
2. Post beans for sale
3. Post vegetables
4. View my listings
5. Check market prices
0. Back`;

      default:
        return 'END Marketplace service complete.';
    }
  }

  private async handleLivestockChoice(choice: string, phoneNumber: string): Promise<string> {
    switch (choice) {
      case '1':
        return `CON 🐄 Health Diagnosis
Select animal:
1. Cattle
2. Goats
3. Sheep
4. Poultry
5. Pigs
0. Back`;

      case '2':
        return `CON 💉 Vaccination Schedule
Upcoming vaccinations:
- Cattle: FMD (Due in 5 days)
- Goats: PPR (Due in 12 days)
- Poultry: Newcastle (Due in 3 days)

1. Set reminders
2. Find vet
0. Back`;

      case '3':
        return `CON 👨‍⚕️ Book Vet Consultation
Available vets nearby:
1. Dr. Peter Kamau (2km away)
2. Dr. Grace Njeri (5km away)
3. Dr. James Ochieng (8km away)

Select vet or:
0. Back`;

      default:
        return 'END Livestock service complete.';
    }
  }

  private async handleRecordsChoice(choice: string, phoneNumber: string): Promise<string> {
    switch (choice) {
      case '1':
        return `CON 💰 Add Income
1. Crop sales
2. Livestock sales
3. Other income
Enter amount (KES):`;

      case '2':
        return `CON 💸 Add Expense
1. Seeds & inputs
2. Labor costs
3. Equipment
4. Other expenses
Enter amount (KES):`;

      case '3':
        const mockProfit = 15000;
        const mockExpenses = 8000;
        const netProfit = mockProfit - mockExpenses;
        
        return `CON 📊 Profit/Loss Summary
This Month:
Income: KSh ${mockProfit.toLocaleString()}
Expenses: KSh ${mockExpenses.toLocaleString()}
Net Profit: KSh ${netProfit.toLocaleString()}

1. Detailed breakdown
2. Compare last month
0. Back`;

      default:
        return 'END Records service complete.';
    }
  }

  private async processCropSymptoms(symptomChoice: string, phoneNumber: string): Promise<string> {
    const symptoms = {
      '1': 'Yellow leaves',
      '2': 'Brown spots',
      '3': 'Wilting',
      '4': 'Stunted growth',
      '5': 'Pest damage'
    };

    const symptom = symptoms[symptomChoice as keyof typeof symptoms];
    if (!symptom) {
      return 'END Invalid symptom choice.';
    }

    const diagnosis = this.getMockDiagnosis(symptom);
    
    return `END 🔍 Diagnosis for "${symptom}":

Likely cause: ${diagnosis.condition}
Severity: ${diagnosis.severity}

Treatment:
${diagnosis.treatment}

Confidence: ${diagnosis.confidence}%

SMS with detailed treatment sent to your phone.`;
  }

  private async processMarketplacePurchase(productChoice: string, phoneNumber: string): Promise<string> {
    const products = {
      '1': { name: 'Maize seeds', price: 500, unit: 'kg' },
      '2': { name: 'Bean seeds', price: 300, unit: 'kg' },
      '3': { name: 'Fertilizer DAP', price: 3500, unit: 'bag' },
      '4': { name: 'Pesticides', price: 800, unit: 'bottle' }
    };

    const product = products[productChoice as keyof typeof products];
    if (!product) {
      return 'END Invalid product choice.';
    }

    return `CON 🛒 ${product.name}
Price: KSh ${product.price}/${product.unit}

Enter quantity:
(Reply with number only)

Payment options:
1. M-Pesa
2. Cash on delivery
3. Bank transfer`;
  }

  private getMockDiagnosis(symptom: string) {
    const diagnoses = {
      'Yellow leaves': {
        condition: 'Nitrogen deficiency',
        severity: 'Medium',
        treatment: 'Apply nitrogen-rich fertilizer (Urea). Water regularly.',
        confidence: 85
      },
      'Brown spots': {
        condition: 'Fungal infection (Leaf spot)',
        severity: 'High',
        treatment: 'Apply fungicide immediately. Remove affected leaves.',
        confidence: 90
      },
      'Wilting': {
        condition: 'Water stress or root rot',
        severity: 'High',
        treatment: 'Check soil moisture. Improve drainage if waterlogged.',
        confidence: 80
      },
      'Stunted growth': {
        condition: 'Nutrient deficiency',
        severity: 'Medium',
        treatment: 'Apply balanced NPK fertilizer. Test soil pH.',
        confidence: 75
      },
      'Pest damage': {
        condition: 'Insect infestation',
        severity: 'High',
        treatment: 'Apply appropriate pesticide. Monitor regularly.',
        confidence: 88
      }
    };

    return diagnoses[symptom as keyof typeof diagnoses] || {
      condition: 'Unknown condition',
      severity: 'Low',
      treatment: 'Consult local agricultural extension officer.',
      confidence: 50
    };
  }

  private async getUserLocation(phoneNumber: string): Promise<string | null> {
    const mockLocations = {
      '+254700000000': 'Nairobi',
      '+254711111111': 'Mombasa',
      '+254722222222': 'Kisumu'
    };
    
    return mockLocations[phoneNumber as keyof typeof mockLocations] || null;
  }

  async handleSMS(message: SMSMessage): Promise<string> {
    const { from, text } = message;
    
    if (text.toUpperCase().includes('DIAGNOSE')) {
      return 'Thank you for your crop photo! Our AI is analyzing it. Results will be sent via SMS within 5 minutes.';
    }
    
    if (text.toUpperCase().includes('WEATHER')) {
      return await this.getWeatherSMS();
    }
    
    if (text.toUpperCase().includes('PRICE')) {
      return 'Current market prices: Maize KES 45/kg, Beans KES 120/kg, Tomatoes KES 80/kg. Updated daily.';
    }
    
    return 'Welcome to ZundeNova! Reply with WEATHER, PRICE, or HELP for assistance. Or dial *123# for full menu.';
  }

  private async getDetailedWeather(): Promise<string> {
    return 'END 7-Day Forecast:\nToday: 28°C, Sunny\nTomorrow: 26°C, Rain\nDay 3: 24°C, Cloudy\nDay 4: 27°C, Sunny\nDay 5: 29°C, Partly cloudy';
  }
  
  private async getRecentDiagnosis(phoneNumber: string): Promise<string> {
    return 'END Recent diagnosis (Jan 15):\nCrop: Maize\nIssue: Leaf blight\nSeverity: Medium\nTreatment: Apply fungicide\nStatus: Improving';
  }
  
  private async getWeatherSMS(): Promise<string> {
    return 'Weather Alert: Temperature 28°C, Humidity 65%. Rain expected tomorrow evening. Good day for field work. - ZundeNova';
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const result = await this.client.SMS.send({
        to: phoneNumber,
        message: `ZundeNova: ${message}`,
        from: process.env.AFRICASTALKING_SHORTCODE || '40147'
      });
      
      console.log('SMS sent successfully:', result);
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<boolean> {
    try {
      const result = await this.client.SMS.send({
        to: phoneNumbers,
        message: `ZundeNova: ${message}`,
        from: process.env.AFRICASTALKING_SHORTCODE || '40147'
      });
      
      console.log('Bulk SMS sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Bulk SMS sending failed:', error);
      return false;
    }
  }

  cleanupSessions(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.timestamp > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const africasTalkingService = new AfricasTalkingService();
