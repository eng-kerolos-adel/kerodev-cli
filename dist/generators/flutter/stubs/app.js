// src/generators/flutter/stubs/app.ts
export function generateMainDart(config, safeName) {
    const smImport = getStateManagerImport(config.stateManager);
    const smWrapper = getStateManagerWrapper(config.stateManager, safeName);
    return `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
${smImport}
${config.features.firebase ? "import 'package:firebase_core/firebase_core.dart';\nimport 'firebase_options.dart';" : ''}
${config.features.supabase ? "import 'package:supabase_flutter/supabase_flutter.dart';" : ''}
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

${config.features.firebase ? `  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
` : ''}
${config.features.supabase ? `  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
  );
` : ''}

  runApp(${smWrapper});
}
`;
}
export function generateAppDart(config) {
    const hasRouter = config.features.goRouter;
    return `import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
${hasRouter ? "import 'core/router/app_router.dart';" : ''}
import 'core/theme/app_theme.dart';
${config.stateManager === 'riverpod' ? "import 'package:hooks_riverpod/hooks_riverpod.dart';" : ''}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(390, 844),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp${hasRouter ? '.router' : ''}(
          title: '${config.name}',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: ThemeMode.system,
${hasRouter ? `          routerConfig: AppRouter.router,` : `          home: const Scaffold(
            body: Center(child: Text('Welcome to ${config.name}')),
          ),`}
        );
      },
    );
  }
}
`;
}
function getStateManagerImport(sm) {
    switch (sm) {
        case 'riverpod': return "import 'package:hooks_riverpod/hooks_riverpod.dart';";
        case 'bloc':
        case 'cubit': return "import 'package:flutter_bloc/flutter_bloc.dart';";
        case 'getx': return "import 'package:get/get.dart';";
        case 'provider': return "import 'package:provider/provider.dart';";
    }
}
function getStateManagerWrapper(sm, safeName) {
    switch (sm) {
        case 'riverpod': return 'const ProviderScope(child: App())';
        case 'getx': return 'const App()';
        case 'provider': return `MultiProvider(
    providers: [
      // Add your providers here
    ],
    child: const App(),
  )`;
        default: return 'const App()';
    }
}
//# sourceMappingURL=app.js.map