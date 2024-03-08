import { FilterQuery, PipelineStage } from 'mongoose';

export function validateIfPipelineStage<T>(
  filter: FilterQuery<T> | PipelineStage[],
  aggregate?: boolean,
): filter is PipelineStage[] {
  if (aggregate) {
    if (!Array.isArray(filter)) {
      throw new Error('Filter must be an array');
    }
    return !!aggregate;
  }
  return !!aggregate;
}
