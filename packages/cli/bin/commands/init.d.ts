import * as _oclif_core_lib_interfaces from '@oclif/core/lib/interfaces';
import { Command } from '@oclif/core';

declare class Init extends Command {
    static description: string;
    static flags: {
        template: _oclif_core_lib_interfaces.OptionFlag<string, _oclif_core_lib_interfaces.CustomOptions>;
    };
    run(): Promise<void>;
}

export { Init as default };
