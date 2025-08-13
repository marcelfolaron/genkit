/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Attributes } from '@opentelemetry/api';
import { 
  resourceFromAttributes, 
  defaultResource, 
  emptyResource
} from '@opentelemetry/resources';

/**
 * OpenTelemetry 2.0 resource utilities.
 * 
 * This module provides a clean interface for working with OTel 2.0 resources,
 * replacing the deprecated Resource class with utility functions.
 */

export interface CompatResource {
  attributes: Attributes;
  merge(other: CompatResource): CompatResource;
  getNativeResource(): any;
}

/**
 * Resource wrapper for OTel 2.0 that provides merge functionality
 */
class ResourceWrapper implements CompatResource {
  private _resource: any;

  constructor(resource: any) {
    this._resource = resource;
  }

  get attributes(): Attributes {
    return this._resource.attributes;
  }

  merge(other: CompatResource): CompatResource {
    // In OTel 2.0, we merge attributes manually since mergeResources doesn't exist
    const mergedAttributes = {
      ...this._resource.attributes,
      ...other.getNativeResource().attributes
    };
    const merged = resourceFromAttributes(mergedAttributes);
    return new ResourceWrapper(merged);
  }

  getNativeResource(): any {
    return this._resource;
  }
}

/**
 * Create a new resource with the given attributes.
 * Uses OTel 2.0 resourceFromAttributes function.
 */
export function createResource(attributes: Attributes = {}): CompatResource {
  const resource = resourceFromAttributes(attributes);
  return new ResourceWrapper(resource);
}

/**
 * Get the default resource.
 * Uses OTel 2.0 defaultResource function.
 */
export function getDefaultResource(): CompatResource {
  const resource = defaultResource();
  return new ResourceWrapper(resource);
}

/**
 * Get an empty resource.
 * Uses OTel 2.0 emptyResource function.
 */
export function getEmptyResource(): CompatResource {
  const resource = emptyResource();
  return new ResourceWrapper(resource);
}

/**
 * Create a resource from detection results.
 * Helper for detector integration.
 */
export function createResourceFromDetector(detectorResult: any): CompatResource {
  let attributes: Attributes = {};
  
  if (detectorResult && detectorResult.attributes) {
    attributes = detectorResult.attributes;
  } else if (detectorResult && typeof detectorResult === 'object') {
    attributes = detectorResult;
  }
  
  const resource = resourceFromAttributes(attributes);
  return new ResourceWrapper(resource);
}