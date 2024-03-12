import wasmUrl from '@wasmcore/pkg/generated_bg.wasm?url';

export * as wasmCore from '@wasmcore/pkg';
import * as wasmModule from '@wasmcore/pkg';

// type ModuleExports = typeof wasmModule;
// export type CoreApi = Omit<ModuleExports, 'initSync' | 'default'>;

let init = wasmModule.default;
// export let wasmCore: CoreApi = { ...wasmModule };

let _isLoaded = false;

export function isCoreLoaded() {
    return _isLoaded;
}

export async function loadWasmCore(): Promise<void> {
    if (_isLoaded)
        return;

    await init(fetch(wasmUrl));
    _isLoaded = true;
}
