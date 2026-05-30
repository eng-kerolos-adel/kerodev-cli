// src/generators/flutter/stubs/router.ts

import type { FlutterProjectConfig } from '../../../types/index.js';

export function generateRouterStub(config: FlutterProjectConfig): string {
  if (!config.features.goRouter) {
    return `// Navigation not configured. Add go_router to pubspec.yaml for routing.\n`;
  }

  return `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

part 'app_router.g.dart';

abstract final class AppRoutes {
  static const home = '/';
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const profile = '/profile';
}

class AppRouter {
  AppRouter._();

  static final _rootNavigatorKey = GlobalKey<NavigatorState>(
    debugLabel: 'root',
  );

  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.home,
    debugLogDiagnostics: true,
    routes: [
      GoRoute(
        path: AppRoutes.home,
        name: 'home',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Home')),
        ),
      ),
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Login')),
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: \${state.uri}'),
      ),
    ),
  );
}
`;
}
