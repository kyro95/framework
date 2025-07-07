import type { ExecutionContext } from '../interfaces';

export interface Guard {
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
