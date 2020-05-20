'use strict';
import * as net from 'net';
import * as path from 'path';
import { workspace, ExtensionContext, window} from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo} from 'vscode-languageclient';


export async function activate(context: ExtensionContext) {
	// Startup options for the language server
	//const lspTransport = workspace.getConfiguration().get("infer.lspTransport", "socket");
	const settings = workspace.getConfiguration("InferIDE");
	const auto = settings.get("auto");
	const timeout = settings.get("timeout");
	const lspTransport = workspace.getConfiguration().get("taintbench.lspTransport", "stdio")
	let script = 'java';
	let relativePath="inferIDE-0.0.1.jar";
	let args = ['-jar',context.asAbsolutePath(relativePath)];
	if(auto.toString()=="true")
		args =['-jar',context.asAbsolutePath(relativePath), "-auto", timeout.toString()];
	const serverOptionsStdio = {
		run : { command: script, args: args },
        debug: { command: script, args: args} 
	}

    const serverOptionsSocket = () => {
		const socket = net.connect({ port: 5007 })
		const result: StreamInfo = {
			writer: socket,
			reader: socket
		}
		return new Promise<StreamInfo>((resolve) => {
			socket.on("connect", () => resolve(result))
			socket.on("error", _ =>
				window.showErrorMessage(
					"Failed to connect to InferIDE language server. Make sure that the language server is running " +
					"-or- configure the extension to connect via standard IO."))
		})
	}
	
	const serverOptions: ServerOptions =
		(lspTransport === "stdio") ? serverOptionsStdio : (lspTransport === "socket") ? serverOptionsSocket : null
		//(lspTransport === "socket") ? serverOptionsSocket : (lspTransport === "stdio") ? serverOptionsStdio : null
   
	let clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'java' }],
        synchronize: {
            configurationSection: 'java',
            fileEvents: [ workspace.createFileSystemWatcher('**/*.java') ]
        }
    };

    // Create the language client and start the client.
    let client : LanguageClient = new LanguageClient('InferIDE','InferIDE', serverOptions, clientOptions);
    client.start();
	await client.onReady();
}

