// src/generators/flutter/configs/analysis.ts

export function generateAnalysisOptions(): string {
  return `include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - '**/*.g.dart'
    - '**/*.freezed.dart'
    - '**/*.gr.dart'
  errors:
    invalid_annotation_target: ignore
    missing_required_param: error
    missing_return: error
    todo: ignore
  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true

linter:
  rules:
    # Style
    prefer_single_quotes: true
    always_use_package_imports: true
    avoid_print: true
    prefer_const_constructors: true
    prefer_const_constructors_in_immutables: true
    prefer_const_literals_to_create_immutables: true
    prefer_const_declarations: true
    avoid_unnecessary_containers: true
    sized_box_for_whitespace: true
    use_decorated_box: true

    # Design
    avoid_public_member_api_docs: false
    use_super_parameters: true
    use_string_buffers: true

    # Errors
    avoid_catching_errors: true
    avoid_slow_async_io: true
    cancel_subscriptions: true
    close_sinks: true

    # Pub
    sort_pub_dependencies: false
`;
}
