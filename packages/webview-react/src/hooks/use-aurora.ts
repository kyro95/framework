import { aurora } from '@aurora-mp/webview';
import React from 'react';

export const useAurora = () => {
    const wrap = <T extends (...args: any[]) => any>(fn: T) =>
        React.useCallback((...args: Parameters<T>) => fn(...args), []);

    return {
        on: wrap(aurora.on),
        onServer: wrap(aurora.onServer),
        emit: wrap(aurora.emit),
        emitServer: wrap(aurora.emitServer),
        invokeClientRpc: wrap(aurora.invokeClientRpc),
        onClientRpc: wrap(aurora.onClientRpc),
        invokeServerRpc: wrap(aurora.invokeServerRpc),
    };
};
