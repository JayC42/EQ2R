/**
 * E2R — Zod validation schemas
 * Enforces the schema rules from equation-to-reality-prompt-v2.md
 */
import { z } from "zod";
export declare const analysisResultSchema: z.ZodEffects<z.ZodObject<{
    principle_name: z.ZodString;
    observed_object: z.ZodString;
    levels: z.ZodObject<{
        child: z.ZodObject<{
            text: z.ZodString;
            transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            transcript: string;
        }, {
            text: string;
            transcript: string;
        }>;
        teen: z.ZodObject<{
            text: z.ZodString;
            transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            transcript: string;
        }, {
            text: string;
            transcript: string;
        }>;
        college: z.ZodObject<{
            text: z.ZodString;
            transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            transcript: string;
        }, {
            text: string;
            transcript: string;
        }>;
        grad: z.ZodObject<{
            text: z.ZodString;
            transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            transcript: string;
        }, {
            text: string;
            transcript: string;
        }>;
        expert: z.ZodObject<{
            text: z.ZodString;
            transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            transcript: string;
        }, {
            text: string;
            transcript: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        child: {
            text: string;
            transcript: string;
        };
        teen: {
            text: string;
            transcript: string;
        };
        college: {
            text: string;
            transcript: string;
        };
        grad: {
            text: string;
            transcript: string;
        };
        expert: {
            text: string;
            transcript: string;
        };
    }, {
        child: {
            text: string;
            transcript: string;
        };
        teen: {
            text: string;
            transcript: string;
        };
        college: {
            text: string;
            transcript: string;
        };
        grad: {
            text: string;
            transcript: string;
        };
        expert: {
            text: string;
            transcript: string;
        };
    }>;
    primary_formula: z.ZodNullable<z.ZodString>;
    formula_name: z.ZodNullable<z.ZodString>;
    variable_definitions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        name: z.ZodString;
        unit: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        unit: string;
        description: string;
    }, {
        name: string;
        unit: string;
        description: string;
    }>>>;
    graph_metadata_tags: z.ZodArray<z.ZodString, "many">;
    nanobanana_icon_prompt: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    related_examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    principle_name: string;
    observed_object: string;
    levels: {
        child: {
            text: string;
            transcript: string;
        };
        teen: {
            text: string;
            transcript: string;
        };
        college: {
            text: string;
            transcript: string;
        };
        grad: {
            text: string;
            transcript: string;
        };
        expert: {
            text: string;
            transcript: string;
        };
    };
    primary_formula: string | null;
    formula_name: string | null;
    variable_definitions: Record<string, {
        name: string;
        unit: string;
        description: string;
    }>;
    graph_metadata_tags: string[];
    nanobanana_icon_prompt: string;
    related_examples?: string[] | undefined;
}, {
    principle_name: string;
    observed_object: string;
    levels: {
        child: {
            text: string;
            transcript: string;
        };
        teen: {
            text: string;
            transcript: string;
        };
        college: {
            text: string;
            transcript: string;
        };
        grad: {
            text: string;
            transcript: string;
        };
        expert: {
            text: string;
            transcript: string;
        };
    };
    primary_formula: string | null;
    formula_name: string | null;
    graph_metadata_tags: string[];
    nanobanana_icon_prompt: string;
    variable_definitions?: Record<string, {
        name: string;
        unit: string;
        description: string;
    }> | undefined;
    related_examples?: string[] | undefined;
}>, {
    principle_name: string;
    observed_object: string;
    levels: {
        child: {
            text: string;
            transcript: string;
        };
        teen: {
            text: string;
            transcript: string;
        };
        college: {
            text: string;
            transcript: string;
        };
        grad: {
            text: string;
            transcript: string;
        };
        expert: {
            text: string;
            transcript: string;
        };
    };
    primary_formula: string | null;
    formula_name: string | null;
    variable_definitions: Record<string, {
        name: string;
        unit: string;
        description: string;
    }>;
    graph_metadata_tags: string[];
    nanobanana_icon_prompt: string;
    related_examples?: string[] | undefined;
}, {
    principle_name: string;
    observed_object: string;
    levels: {
        child: {
            text: string;
            transcript: string;
        };
        teen: {
            text: string;
            transcript: string;
        };
        college: {
            text: string;
            transcript: string;
        };
        grad: {
            text: string;
            transcript: string;
        };
        expert: {
            text: string;
            transcript: string;
        };
    };
    primary_formula: string | null;
    formula_name: string | null;
    graph_metadata_tags: string[];
    nanobanana_icon_prompt: string;
    variable_definitions?: Record<string, {
        name: string;
        unit: string;
        description: string;
    }> | undefined;
    related_examples?: string[] | undefined;
}>;
export declare const processLessonRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    rawAnalysisResult: z.ZodEffects<z.ZodObject<{
        principle_name: z.ZodString;
        observed_object: z.ZodString;
        levels: z.ZodObject<{
            child: z.ZodObject<{
                text: z.ZodString;
                transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
            }, "strip", z.ZodTypeAny, {
                text: string;
                transcript: string;
            }, {
                text: string;
                transcript: string;
            }>;
            teen: z.ZodObject<{
                text: z.ZodString;
                transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
            }, "strip", z.ZodTypeAny, {
                text: string;
                transcript: string;
            }, {
                text: string;
                transcript: string;
            }>;
            college: z.ZodObject<{
                text: z.ZodString;
                transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
            }, "strip", z.ZodTypeAny, {
                text: string;
                transcript: string;
            }, {
                text: string;
                transcript: string;
            }>;
            grad: z.ZodObject<{
                text: z.ZodString;
                transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
            }, "strip", z.ZodTypeAny, {
                text: string;
                transcript: string;
            }, {
                text: string;
                transcript: string;
            }>;
            expert: z.ZodObject<{
                text: z.ZodString;
                transcript: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
            }, "strip", z.ZodTypeAny, {
                text: string;
                transcript: string;
            }, {
                text: string;
                transcript: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            child: {
                text: string;
                transcript: string;
            };
            teen: {
                text: string;
                transcript: string;
            };
            college: {
                text: string;
                transcript: string;
            };
            grad: {
                text: string;
                transcript: string;
            };
            expert: {
                text: string;
                transcript: string;
            };
        }, {
            child: {
                text: string;
                transcript: string;
            };
            teen: {
                text: string;
                transcript: string;
            };
            college: {
                text: string;
                transcript: string;
            };
            grad: {
                text: string;
                transcript: string;
            };
            expert: {
                text: string;
                transcript: string;
            };
        }>;
        primary_formula: z.ZodNullable<z.ZodString>;
        formula_name: z.ZodNullable<z.ZodString>;
        variable_definitions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
            name: z.ZodString;
            unit: z.ZodString;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            unit: string;
            description: string;
        }, {
            name: string;
            unit: string;
            description: string;
        }>>>;
        graph_metadata_tags: z.ZodArray<z.ZodString, "many">;
        nanobanana_icon_prompt: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        related_examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        principle_name: string;
        observed_object: string;
        levels: {
            child: {
                text: string;
                transcript: string;
            };
            teen: {
                text: string;
                transcript: string;
            };
            college: {
                text: string;
                transcript: string;
            };
            grad: {
                text: string;
                transcript: string;
            };
            expert: {
                text: string;
                transcript: string;
            };
        };
        primary_formula: string | null;
        formula_name: string | null;
        variable_definitions: Record<string, {
            name: string;
            unit: string;
            description: string;
        }>;
        graph_metadata_tags: string[];
        nanobanana_icon_prompt: string;
        related_examples?: string[] | undefined;
    }, {
        principle_name: string;
        observed_object: string;
        levels: {
            child: {
                text: string;
                transcript: string;
            };
            teen: {
                text: string;
                transcript: string;
            };
            college: {
                text: string;
                transcript: string;
            };
            grad: {
                text: string;
                transcript: string;
            };
            expert: {
                text: string;
                transcript: string;
            };
        };
        primary_formula: string | null;
        formula_name: string | null;
        graph_metadata_tags: string[];
        nanobanana_icon_prompt: string;
        variable_definitions?: Record<string, {
            name: string;
            unit: string;
            description: string;
        }> | undefined;
        related_examples?: string[] | undefined;
    }>, {
        principle_name: string;
        observed_object: string;
        levels: {
            child: {
                text: string;
                transcript: string;
            };
            teen: {
                text: string;
                transcript: string;
            };
            college: {
                text: string;
                transcript: string;
            };
            grad: {
                text: string;
                transcript: string;
            };
            expert: {
                text: string;
                transcript: string;
            };
        };
        primary_formula: string | null;
        formula_name: string | null;
        variable_definitions: Record<string, {
            name: string;
            unit: string;
            description: string;
        }>;
        graph_metadata_tags: string[];
        nanobanana_icon_prompt: string;
        related_examples?: string[] | undefined;
    }, {
        principle_name: string;
        observed_object: string;
        levels: {
            child: {
                text: string;
                transcript: string;
            };
            teen: {
                text: string;
                transcript: string;
            };
            college: {
                text: string;
                transcript: string;
            };
            grad: {
                text: string;
                transcript: string;
            };
            expert: {
                text: string;
                transcript: string;
            };
        };
        primary_formula: string | null;
        formula_name: string | null;
        graph_metadata_tags: string[];
        nanobanana_icon_prompt: string;
        variable_definitions?: Record<string, {
            name: string;
            unit: string;
            description: string;
        }> | undefined;
        related_examples?: string[] | undefined;
    }>;
    sourceImageBase64: z.ZodOptional<z.ZodString>;
    sourceImageMimeType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    rawAnalysisResult: {
        principle_name: string;
        observed_object: string;
        levels: {
            child: {
                text: string;
                transcript: string;
            };
            teen: {
                text: string;
                transcript: string;
            };
            college: {
                text: string;
                transcript: string;
            };
            grad: {
                text: string;
                transcript: string;
            };
            expert: {
                text: string;
                transcript: string;
            };
        };
        primary_formula: string | null;
        formula_name: string | null;
        variable_definitions: Record<string, {
            name: string;
            unit: string;
            description: string;
        }>;
        graph_metadata_tags: string[];
        nanobanana_icon_prompt: string;
        related_examples?: string[] | undefined;
    };
    sourceImageBase64?: string | undefined;
    sourceImageMimeType?: string | undefined;
}, {
    userId: string;
    rawAnalysisResult: {
        principle_name: string;
        observed_object: string;
        levels: {
            child: {
                text: string;
                transcript: string;
            };
            teen: {
                text: string;
                transcript: string;
            };
            college: {
                text: string;
                transcript: string;
            };
            grad: {
                text: string;
                transcript: string;
            };
            expert: {
                text: string;
                transcript: string;
            };
        };
        primary_formula: string | null;
        formula_name: string | null;
        graph_metadata_tags: string[];
        nanobanana_icon_prompt: string;
        variable_definitions?: Record<string, {
            name: string;
            unit: string;
            description: string;
        }> | undefined;
        related_examples?: string[] | undefined;
    };
    sourceImageBase64?: string | undefined;
    sourceImageMimeType?: string | undefined;
}>;
export type ValidatedAnalysisResult = z.infer<typeof analysisResultSchema>;
export type ValidatedProcessLessonRequest = z.infer<typeof processLessonRequestSchema>;
//# sourceMappingURL=validation.d.ts.map