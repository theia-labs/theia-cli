## Installation

To install theia-cli globally (executable from any terminal), run the following command:

```bash
npm install -g theia-cli
```

## Execute module

As explained in the introduction, the CLI works with modules. Each module implements a feature.

To execute a module, you must run the following command:

```bash
theia-cli [module] [options]
```

To know the list of modules, it is possible to use the following command:

```bash
theia-cli help
```

You can also consult the [list of modules](./modules.md).

## Configuration

To work, the CLI needs several parameters, such as your API key. To avoid entering these parameters each time you use it, it is advisable to set them persistently using the [`theia-cli config`](modules.md#configuration) command.

The configurable parameters are as follows:

| Variable | Definition | Type |
| --- | --- | --- |
| key | Your API key | String |
| environment | The URL of your environment (https://elffe.theia.fr or https://side-sante.fr) | String |
| exportPath | The absolute path of the folder where you want to save the files exported by the CLI | String |
| ratingScale | The rating scale you want to use when exporting grades | Number |

## [Documentation](https://theia-labs.github.io/en/cli/)
