import { africasTalkingService } from './africasTalkingService';

interface USSDSession {
  sessionId: string;
  phoneNumber: string;
  currentMenu: string;
  userData: Record<string, any>;
  language: string;
  step: number;
}

interface USSDMenu {
  id: string;
  title: Record<string, string>; // Multi-language support
  options: USSDOption[];
  handler?: (session: USSDSession, input: string) => Promise<USSDResponse>;
}

interface USSDOption {
  key: string;
  text: Record<string, string>;
  action: 'menu' | 'function' | 'voice' | 'end';
  target?: string;
}

interface USSDResponse {
  text: string;
  continueSession: boolean;
  nextMenu?: string;
}

class EnhancedUSSDService {
  private sessions: Map<string, USSDSession> = new Map();
  private menus: Map<string, USSDMenu> = new Map();

  constructor() {
    this.initializeMenus();
  }

  private initializeMenus() {
    this.menus.set('main', {
      id: 'main',
      title: {
        en: 'Welcome to ZundeNova\n1. Crop Diagnosis\n2. Livestock Care\n3. Weather\n4. Marketplace\n5. Farm Records\n6. Voice Menu\n7. Learning\n8. Community\n9. Prices\n0. Help',
        sw: 'Karibu ZundeNova\n1. Uchunguzi Mazao\n2. Huduma Mifugo\n3. Hali ya Hewa\n4. Soko\n5. Rekodi Shamba\n6. Menyu ya Sauti\n7. Kujifunza\n8. Jamii\n9. Bei\n0. Msaada',
        zu: 'Siyakwamukela ku-ZundeNova\n1. Ukuhlola Izitshalo\n2. Ukunakekela Izifuyo\n3. Isimo Sezulu\n4. Imakethe\n5. Amarekhodi Epulazi\n6. Imenyu Yezwi\n7. Ukufunda\n8. Umphakathi\n9. Amanani\n0. Usizo'
      },
      options: [
        { key: '1', text: { en: 'Crop Diagnosis', sw: 'Uchunguzi Mazao', zu: 'Ukuhlola Izitshalo' }, action: 'menu', target: 'crop_diagnosis' },
        { key: '2', text: { en: 'Livestock Care', sw: 'Huduma Mifugo', zu: 'Ukunakekela Izifuyo' }, action: 'menu', target: 'livestock_care' },
        { key: '3', text: { en: 'Weather', sw: 'Hali ya Hewa', zu: 'Isimo Sezulu' }, action: 'function', target: 'get_weather' },
        { key: '4', text: { en: 'Marketplace', sw: 'Soko', zu: 'Imakethe' }, action: 'menu', target: 'marketplace' },
        { key: '5', text: { en: 'Farm Records', sw: 'Rekodi Shamba', zu: 'Amarekhodi Epulazi' }, action: 'menu', target: 'farm_records' },
        { key: '6', text: { en: 'Voice Menu', sw: 'Menyu ya Sauti', zu: 'Imenyu Yezwi' }, action: 'voice', target: 'voice_menu' },
        { key: '7', text: { en: 'Learning', sw: 'Kujifunza', zu: 'Ukufunda' }, action: 'menu', target: 'learning' },
        { key: '8', text: { en: 'Community', sw: 'Jamii', zu: 'Umphakathi' }, action: 'menu', target: 'community' },
        { key: '9', text: { en: 'Prices', sw: 'Bei', zu: 'Amanani' }, action: 'function', target: 'get_prices' },
        { key: '0', text: { en: 'Help', sw: 'Msaada', zu: 'Usizo' }, action: 'menu', target: 'help' }
      ]
    });

    this.menus.set('crop_diagnosis', {
      id: 'crop_diagnosis',
      title: {
        en: 'Crop Diagnosis\n1. Describe symptoms\n2. Upload photo via SMS\n3. Common diseases\n4. Treatment guide\n0. Back',
        sw: 'Uchunguzi Mazao\n1. Eleza dalili\n2. Tuma picha kwa SMS\n3. Magonjwa ya kawaida\n4. Mwongozo wa matibabu\n0. Rudi',
        zu: 'Ukuhlola Izitshalo\n1. Chaza izimpawu\n2. Thumela isithombe nge-SMS\n3. Izifo ezivamile\n4. Umhlahlandlela wokwelapha\n0. Buyela'
      },
      options: [
        { key: '1', text: { en: 'Describe symptoms', sw: 'Eleza dalili', zu: 'Chaza izimpawu' }, action: 'function', target: 'describe_symptoms' },
        { key: '2', text: { en: 'Upload photo via SMS', sw: 'Tuma picha kwa SMS', zu: 'Thumela isithombe nge-SMS' }, action: 'function', target: 'photo_upload' },
        { key: '3', text: { en: 'Common diseases', sw: 'Magonjwa ya kawaida', zu: 'Izifo ezivamile' }, action: 'menu', target: 'common_diseases' },
        { key: '4', text: { en: 'Treatment guide', sw: 'Mwongozo wa matibabu', zu: 'Umhlahlandlela wokwelapha' }, action: 'menu', target: 'treatment_guide' },
        { key: '0', text: { en: 'Back', sw: 'Rudi', zu: 'Buyela' }, action: 'menu', target: 'main' }
      ]
    });

    this.menus.set('livestock_care', {
      id: 'livestock_care',
      title: {
        en: 'Livestock Care\n1. Health check\n2. Vaccination schedule\n3. Breeding records\n4. Vet consultation\n0. Back',
        sw: 'Huduma za Mifugo\n1. Uchunguzi wa afya\n2. Ratiba ya chanjo\n3. Rekodi za uzazi\n4. Ushauri wa daktari\n0. Rudi',
        zu: 'Ukunakekela Izifuyo\n1. Ukuhlola impilo\n2. Uhlelo lokugoma\n3. Amarekhodi okuzala\n4. Ukubonana nodokotela wezilwane\n0. Buyela'
      },
      options: [
        { key: '1', text: { en: 'Health check', sw: 'Uchunguzi wa afya', zu: 'Ukuhlola impilo' }, action: 'function', target: 'health_check' },
        { key: '2', text: { en: 'Vaccination schedule', sw: 'Ratiba ya chanjo', zu: 'Uhlelo lokugoma' }, action: 'function', target: 'vaccination_schedule' },
        { key: '3', text: { en: 'Breeding records', sw: 'Rekodi za uzazi', zu: 'Amarekhodi okuzala' }, action: 'function', target: 'breeding_records' },
        { key: '4', text: { en: 'Vet consultation', sw: 'Ushauri wa daktari', zu: 'Ukubonana nodokotela wezilwane' }, action: 'function', target: 'vet_consultation' },
        { key: '0', text: { en: 'Back', sw: 'Rudi', zu: 'Buyela' }, action: 'menu', target: 'main' }
      ]
    });

    this.menus.set('voice_menu', {
      id: 'voice_menu',
      title: {
        en: 'Voice Menu\nCall will start voice navigation.\nSpeak your request clearly.\nPress any key to continue.',
        sw: 'Menyu ya Sauti\nSimu itaanza uongozaji wa sauti.\nSema ombi lako kwa uwazi.\nBonyeza kibonye chochote kuendelea.',
        zu: 'Imenyu Yezwi\nUcingo luzokwazi ukuqondisa ngezwi.\nKhuluma isicelo sakho ngokucacile.\nCindezela noma yikuphi ukuqhubeka.'
      },
      options: [],
      handler: async (session: USSDSession, input: string) => {
        await this.initiateVoiceCall(session.phoneNumber);
        return {
          text: this.getLocalizedText(session.language, {
            en: 'Voice call initiated. Please wait for the call.',
            sw: 'Simu ya sauti imeanzishwa. Tafadhali subiri simu.',
            zu: 'Ucingo lwezwi luqalisiwe. Sicela ulinde ucingo.'
          }),
          continueSession: false
        };
      }
    });
  }

  async handleUSSDRequest(phoneNumber: string, text: string, sessionId: string): Promise<string> {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = {
        sessionId,
        phoneNumber,
        currentMenu: 'main',
        userData: {},
        language: await this.detectLanguage(phoneNumber) || 'en',
        step: 0
      };
      this.sessions.set(sessionId, session);
    }

    const input = text.split('*').pop() || '';
    const menu = this.menus.get(session.currentMenu);

    if (!menu) {
      return this.endSession(sessionId, 'Invalid menu');
    }

    if (menu.handler) {
      const response = await menu.handler(session, input);
      if (!response.continueSession) {
        this.sessions.delete(sessionId);
        return `END ${response.text}`;
      }
      if (response.nextMenu) {
        session.currentMenu = response.nextMenu;
      }
      return `CON ${response.text}`;
    }

    const option = menu.options.find(opt => opt.key === input);
    
    if (!option) {
      const menuText = this.getLocalizedText(session.language, menu.title);
      return `CON ${menuText}`;
    }

    switch (option.action) {
      case 'menu':
        session.currentMenu = option.target!;
        const nextMenu = this.menus.get(option.target!);
        if (nextMenu) {
          const nextMenuText = this.getLocalizedText(session.language, nextMenu.title);
          return `CON ${nextMenuText}`;
        }
        break;

      case 'function':
        const result = await this.executeFunction(option.target!, session, input);
        if (result.continueSession) {
          return `CON ${result.text}`;
        } else {
          this.sessions.delete(sessionId);
          return `END ${result.text}`;
        }

      case 'voice':
        await this.initiateVoiceCall(phoneNumber);
        this.sessions.delete(sessionId);
        return `END ${this.getLocalizedText(session.language, {
          en: 'Voice call initiated. Please wait for the call.',
          sw: 'Simu ya sauti imeanzishwa. Tafadhali subiri simu.',
          zu: 'Ucingo lwezwi luqalisiwe. Sicela ulinde ucingo.'
        })}`;

      case 'end':
        this.sessions.delete(sessionId);
        return `END ${this.getLocalizedText(session.language, option.text)}`;
    }

    return this.endSession(sessionId, 'Invalid option');
  }

  private async executeFunction(functionName: string, session: USSDSession, input: string): Promise<USSDResponse> {
    switch (functionName) {
      case 'get_weather':
        return await this.getWeatherInfo(session);
      
      case 'get_prices':
        return await this.getMarketPrices(session);
      
      case 'describe_symptoms':
        return await this.handleSymptomDescription(session, input);
      
      case 'photo_upload':
        return await this.handlePhotoUpload(session);
      
      case 'health_check':
        return await this.handleHealthCheck(session);
      
      case 'vaccination_schedule':
        return await this.getVaccinationSchedule(session);
      
      case 'breeding_records':
        return await this.getBreedingRecords(session);
      
      case 'vet_consultation':
        return await this.scheduleVetConsultation(session);
      
      default:
        return {
          text: this.getLocalizedText(session.language, {
            en: 'Function not available',
            sw: 'Huduma haipatikani',
            zu: 'Umsebenzi awutholakali'
          }),
          continueSession: false
        };
    }
  }

  private async getWeatherInfo(session: USSDSession): Promise<USSDResponse> {
    const weatherData = {
      temperature: '28°C',
      condition: 'Partly cloudy',
      humidity: '65%',
      rainfall: '5mm expected'
    };

    const text = this.getLocalizedText(session.language, {
      en: `Weather Today:\nTemp: ${weatherData.temperature}\nCondition: ${weatherData.condition}\nHumidity: ${weatherData.humidity}\nRainfall: ${weatherData.rainfall}`,
      sw: `Hali ya Hewa Leo:\nJoto: ${weatherData.temperature}\nHali: Mawingu kidogo\nUnyevu: ${weatherData.humidity}\nMvua: ${weatherData.rainfall}`,
      zu: `Isimo Sezulu Namuhla:\nIzinga lokushisa: ${weatherData.temperature}\nIsimo: Kunamafu kancane\nUmswakama: ${weatherData.humidity}\nImvula: ${weatherData.rainfall}`
    });

    return { text, continueSession: false };
  }

  private async getMarketPrices(session: USSDSession): Promise<USSDResponse> {
    const prices = {
      maize: 'KSh 45/kg',
      beans: 'KSh 120/kg',
      tomatoes: 'KSh 80/kg'
    };

    const text = this.getLocalizedText(session.language, {
      en: `Market Prices:\nMaize: ${prices.maize}\nBeans: ${prices.beans}\nTomatoes: ${prices.tomatoes}`,
      sw: `Bei za Soko:\nMahindi: ${prices.maize}\nMaharagwe: ${prices.beans}\nNyanya: ${prices.tomatoes}`,
      zu: `Amanani Emakethe:\nUmbila: ${prices.maize}\nUbhontshisi: ${prices.beans}\nUtamatisi: ${prices.tomatoes}`
    });

    return { text, continueSession: false };
  }

  private async handleSymptomDescription(session: USSDSession, input: string): Promise<USSDResponse> {
    const text = this.getLocalizedText(session.language, {
      en: 'Please send an SMS to this number describing the symptoms you observe in your crops. Include details like leaf color, spots, wilting, etc.',
      sw: 'Tafadhali tuma SMS kwa nambari hii ukieleza dalili unazoziona kwenye mazao yako. Jumuisha maelezo kama rangi ya majani, madoa, kunyauka, n.k.',
      zu: 'Sicela uthumele i-SMS kule nombolo uchaze izimpawu ozibona ezitshalweni zakho. Faka imininingwane efana nombala wamaqabunga, amabala, ukubuna, njll.'
    });

    return { text, continueSession: false };
  }

  private async handlePhotoUpload(session: USSDSession): Promise<USSDResponse> {
    const text = this.getLocalizedText(session.language, {
      en: 'To upload a photo:\n1. Take a clear photo of the affected plant\n2. Send it via MMS to this number\n3. You will receive diagnosis within 5 minutes',
      sw: 'Kupakia picha:\n1. Piga picha wazi ya mmea ulioathiriwa\n2. Itume kwa njia ya MMS kwa nambari hii\n3. Utapokea uchunguzi ndani ya dakika 5',
      zu: 'Ukuthumela isithombe:\n1. Thatha isithombe esicacile sesitshalo esithintekile\n2. Sithumele nge-MMS kule nombolo\n3. Uzothola ukuhlolwa phakathi kwemizuzu emi-5'
    });

    return { text, continueSession: false };
  }

  private async handleHealthCheck(session: USSDSession): Promise<USSDResponse> {
    const text = this.getLocalizedText(session.language, {
      en: 'Livestock Health Check:\n1. Check body temperature\n2. Observe eating habits\n3. Look for unusual behavior\n4. Check for physical symptoms\nSend SMS with observations for advice.',
      sw: 'Uchunguzi wa Afya ya Mifugo:\n1. Angalia joto la mwili\n2. Chunguza tabia za kula\n3. Tafuta tabia zisizo za kawaida\n4. Angalia dalili za kimwili\nTuma SMS na uchunguzi kwa ushauri.',
      zu: 'Ukuhlola Impilo Yezifuyo:\n1. Hlola izinga lokushisa lomzimba\n2. Buka imikhuba yokudla\n3. Bheka ukuziphatha okungajwayelekile\n4. Hlola izimpawu zomzimba\nThumela i-SMS nezinto ozibonile ukuze uthole iseluleko.'
    });

    return { text, continueSession: false };
  }

  private async getVaccinationSchedule(session: USSDSession): Promise<USSDResponse> {
    const text = this.getLocalizedText(session.language, {
      en: 'Vaccination Schedule:\nCattle: FMD - Every 6 months\nPoultry: Newcastle - Every 3 months\nGoats: PPR - Annually\nFor specific dates, send SMS with animal type and age.',
      sw: 'Ratiba ya Chanjo:\nNg\'ombe: FMD - Kila miezi 6\nKuku: Newcastle - Kila miezi 3\nMbuzi: PPR - Kila mwaka\nKwa tarehe maalum, tuma SMS na aina ya mnyama na umri.',
      zu: 'Uhlelo Lokugoma:\nInkomo: FMD - Njalo ezinyangeni ezi-6\nInkukhu: Newcastle - Njalo ezinyangeni ezi-3\nImbuzi: PPR - Minyaka yonke\nNgezinsuku ezithile, thumela i-SMS nohlobo lwezilwane nobudala.'
    });

    return { text, continueSession: false };
  }

  private async getBreedingRecords(session: USSDSession): Promise<USSDResponse> {
    const text = this.getLocalizedText(session.language, {
      en: 'Breeding Records:\nTo track breeding:\n1. Record mating dates\n2. Expected delivery dates\n3. Offspring records\nSend SMS to update records: BREED [Animal ID] [Date] [Details]',
      sw: 'Rekodi za Uzazi:\nKufuatilia uzazi:\n1. Rekodi tarehe za kupandana\n2. Tarehe za kuzaa zinazotarajiwa\n3. Rekodi za watoto\nTuma SMS kuboresha rekodi: UZAZI [Kitambulisho cha Mnyama] [Tarehe] [Maelezo]',
      zu: 'Amarekhodi Okuzala:\nUkulandelela ukuzala:\n1. Rekhoda izinsuku zokuxhumana\n2. Izinsuku ezilindelwe zokubeletha\n3. Amarekhodi abantwana\nThumela i-SMS ukuvuselela amarekhodi: ZALA [ID Yesilwane] [Usuku] [Imininingwane]'
    });

    return { text, continueSession: false };
  }

  private async scheduleVetConsultation(session: USSDSession): Promise<USSDResponse> {
    const text = this.getLocalizedText(session.language, {
      en: 'Vet Consultation:\nTo schedule:\n1. Send SMS: VET [Animal type] [Symptoms] [Preferred date]\n2. Available vets will respond\n3. Confirm appointment\nEmergency: Call directly for urgent cases',
      sw: 'Ushauri wa Daktari:\nKuratibisha:\n1. Tuma SMS: DAKTARI [Aina ya mnyama] [Dalili] [Tarehe unayopendelea]\n2. Madaktari waliopo watajibu\n3. Thibitisha miadi\nDharura: Piga simu moja kwa moja kwa kesi za haraka',
      zu: 'Ukubonana Nodokotela Wezilwane:\nUkuhlela:\n1. Thumela i-SMS: DOKOTELA [Uhlobo lwesilwane] [Izimpawu] [Usuku olukhethayo]\n2. Odokotela abatholakalayo bazophendula\n3. Qinisekisa isikhathi\nIsiphuthuma: Shayela ngqo ezimweni eziphuthumayo'
    });

    return { text, continueSession: false };
  }

  private async initiateVoiceCall(phoneNumber: string): Promise<void> {
    try {
      console.log(`Initiating voice call to ${phoneNumber}`);
      // await africasTalkingService.initiateCall(phoneNumber, `voice_${Date.now()}`);
    } catch (error) {
      console.error('Failed to initiate voice call:', error);
    }
  }

  private async detectLanguage(phoneNumber: string): Promise<string> {
    if (phoneNumber.startsWith('+254')) return 'sw'; // Kenya - Swahili
    if (phoneNumber.startsWith('+27')) return 'zu'; // South Africa - Zulu
    if (phoneNumber.startsWith('+233')) return 'en'; // Ghana - English
    if (phoneNumber.startsWith('+234')) return 'en'; // Nigeria - English
    return 'en'; // Default to English
  }

  private getLocalizedText(language: string, texts: Record<string, string>): string {
    return texts[language] || texts['en'] || 'Text not available';
  }

  private endSession(sessionId: string, message: string): string {
    this.sessions.delete(sessionId);
    return `END ${message}`;
  }
}

export const enhancedUSSDService = new EnhancedUSSDService();
