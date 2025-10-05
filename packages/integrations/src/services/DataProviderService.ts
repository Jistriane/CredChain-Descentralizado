import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export class DataProviderService {
  private serasaApiKey: string;
  private spcApiKey: string;
  private boavistaApiKey: string;

  constructor() {
    this.serasaApiKey = config.SERASA_API_KEY;
    this.spcApiKey = config.SPC_API_KEY;
    this.boavistaApiKey = config.BOAVISTA_API_KEY;
  }

  public async getSerasaData(cpf: string): Promise<any> {
    try {
      const response = await axios.post('https://api.serasa.com.br/consulta', {
        cpf: cpf,
        api_key: this.serasaApiKey,
      });

      return response.data;
    } catch (error) {
      logger.error('Serasa API failed:', error);
      throw error;
    }
  }

  public async getSPCData(cpf: string): Promise<any> {
    try {
      const response = await axios.post('https://api.spc.com.br/consulta', {
        cpf: cpf,
        api_key: this.spcApiKey,
      });

      return response.data;
    } catch (error) {
      logger.error('SPC API failed:', error);
      throw error;
    }
  }

  public async getBoaVistaData(cpf: string): Promise<any> {
    try {
      const response = await axios.post('https://api.boavista.com.br/consulta', {
        cpf: cpf,
        api_key: this.boavistaApiKey,
      });

      return response.data;
    } catch (error) {
      logger.error('Boa Vista API failed:', error);
      throw error;
    }
  }

  public async getReceitaFederalData(cpf: string): Promise<any> {
    try {
      const response = await axios.post('https://api.receita.fazenda.gov.br/consulta', {
        cpf: cpf,
      });

      return response.data;
    } catch (error) {
      logger.error('Receita Federal API failed:', error);
      throw error;
    }
  }
}
