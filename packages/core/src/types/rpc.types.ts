import { MethodParameter } from '../interfaces';
import { RpcType } from '../enums';

export interface RpcMetadata {
    type: RpcType;
    name: string;
    methodName: string;
    params: MethodParameter[];
    webViewId?: string | number | undefined;
}
