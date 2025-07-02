import { MethodParameter } from '../interfaces';
import { RpcType } from '../enums';

export interface RpcMetadata {
    type: RpcType;
    name: string;
    methodName: string;
    params: MethodParameter[];
    // TODO: webViewId?: string | number | undefined;
}
