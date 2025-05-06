import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ExchangeRateService {
  constructor(private httpService: HttpService) {}

   /**
    * getRates
    *
    * @param {string} [base='USD']
    * @param {string[]} [currencies=['EUR', 'GBP', 'JPY', 'MXN', 'CAD']]
    * @return {*}  {Promise<Record<string, number>>}
    * @memberof ExchangeRateService
    */
    async getRates(
        base: string = 'USD',
        currencies: string[] = ['EUR', 'GBP', 'JPY', 'MXN', 'CAD']
    ): Promise<Record<string, number>> {
    const response = await lastValueFrom(
      this.httpService.get(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${base}`)
    );
    const data = response.data;

    if (!data.conversion_rates) {
      throw new Error("ExchangeRateService: No conversion rates found");
    }

    const rates: Record<string, number> = {};
    for (const cur of currencies) {
      rates[cur] = data.conversion_rates?.[cur] ?? 0;
    }
    return rates;
  }
}
