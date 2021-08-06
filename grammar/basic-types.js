'use strict';

/**
 * https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#basic-types
 */

function listVectorTypes() {
    const vectorTypes = [];

    const prefixes = ['', 'd', 'b', 'i', 'u'];
    const suffixes = ['2', '3', '4'];

    for (const prefix of prefixes) {
        for (const suffix of suffixes) {
            vectorTypes.push(`${prefix}vec${suffix}`);
        }
    }

    return vectorTypes;
}

function listMatricTypes() {
    const matrixTypes = [];

    const prefixes = ['', 'd'];
    const suffixes = ['2', '3', '4'];

    for (const prefix of prefixes) {
        for (const suffix of suffixes) {
            matrixTypes.push(`${prefix}mat${suffix}`);

            for (const suffixRepeat of suffixes) {
                matrixTypes.push(`${prefix}mat${suffix}x${suffixRepeat}`);
            }
        }
    }

    return matrixTypes;
}

function listOpaqueTypes() {
    const opaqueTypes = [
        'sampler1DShadow',
        'sampler1DArrayShadow',
        'sampler2DShadow',
        'sampler2DArrayShadow',
        'sampler2DRectShadow',
        'samplerCubeShadow',
        'samplerCubeArrayShadow',
        'subpassInput',
        'subpassInputMS',
        'isubpassInput',
        'isubpassInputMS',
        'atomic_uint',
        'usubpassInput',
        'usubpassInputMS',
    ];

    const types = ['sampler', 'texture', 'image'];
    const prefixes = ['', 'i', 'u'];
    const suffixes = [
        '1D',
        '1DArray',
        '2D',
        '2DArray',
        '2DMS',
        '2DMSArray',
        '2DRect',
        '3D',
        'Cube',
        'CubeArray',
        'Buffer',
    ];

    for (const type of types) {
        for (const prefix of prefixes) {
            for (const suffix of suffixes) {
                 opaqueTypes.push(`${prefix}${type}${suffix}`);
            }
        }
    }

    return opaqueTypes;
}

const TRANSPARENT_TYPES = [
    'void',
    'bool',
    'int',
    'uint',
    'float',
    'double',
    ...listVectorTypes(),
    ...listMatricTypes(),
];

const OPAQUE_TYPES = listOpaqueTypes();

const BASIC_TYPES = [...TRANSPARENT_TYPES, ...OPAQUE_TYPES];

module.exports = BASIC_TYPES;
