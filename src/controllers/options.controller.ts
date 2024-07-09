import { CreateOptionsDto } from '@/dtos/options.dto';
import { Options } from '@/interfaces/options.interface';
import { Options2Service } from '@/services/options.service';
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';

export class OptionsController {
  public optionsService = Container.get(Options2Service);

  public getAllOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllOptions: Options[] = await this.optionsService.getAllOptions();
      res.status(200).json({ data: findAllOptions });
    } catch (error) {
      next(error);
    }
  };

  public getOptionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const optionId = Number(req.query.id);
      const findOneOption = await this.optionsService.getOptionById(optionId);
      res.status(200).json({ data: findOneOption });
    } catch (error) {
      next(error);
    }
  };

  public createOption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const optionData: CreateOptionsDto = req.body;
      const createOptionData: Options = await this.optionsService.createOption(optionData);
      res.status(201).json({ data: createOptionData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateOption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const optionId =  Number(req.query.id);
      const optionData: CreateOptionsDto = req.body;
      const updateOptionData: Options = await this.optionsService.updateOption(optionId, optionData);
      res.status(200).json({ data: updateOptionData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteOption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const optionId = Number(req.query.id);
      const deleteOptionData: Options = await this.optionsService.deleteOption(optionId);
      res.status(200).json({ data: deleteOptionData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
