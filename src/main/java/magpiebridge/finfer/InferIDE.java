package magpiebridge.finfer;

import java.io.IOException;
import java.util.function.Supplier;
import magpiebridge.core.IProjectService;
import magpiebridge.core.MagpieServer;
import magpiebridge.core.ServerAnalysis;
import magpiebridge.core.ServerConfiguration;
import magpiebridge.core.ToolAnalysis;
import magpiebridge.projectservice.java.JavaProjectService;
import org.eclipse.lsp4j.jsonrpc.messages.Either;

public class InferIDE {
  public static void main(String... args) throws IOException, InterruptedException {
    Supplier<MagpieServer> createServer = () -> {
      ServerConfiguration config = new ServerConfiguration();
      config.setDoAnalysisByOpen(false);
      config.setDoAnalysisBySave(false);
      config.setShowConfigurationPage(true, true);
      MagpieServer server = new MagpieServer(config);
      String language = "java";
      IProjectService javaProjectService = new JavaProjectService();
      server.addProjectService(language, javaProjectService);
      ToolAnalysis analysis = new InferServerAnalysis();
      Either<ServerAnalysis, ToolAnalysis> either = Either.forRight(analysis);
      server.addAnalysis(either, language);
      return server;
    };
    // createServer.get().launchOnStdio();
    MagpieServer.launchOnSocketPort(5007, createServer);
  }
}
