const fs = require("fs");
const colors = require("colors");
const parser = require("./parser.js");

const vg = require("vega");
const vegalite = require("vega-lite");
const { error } = require("console");

const cli = require("@caporal/core").default;

cli
  .version("parser-cli")
  .version("0.01")
  // check Data File
  .command("check", "Check if <file> is a valid data file")
  .argument("<file>", "The file to check with Vpf parser")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      var analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        logger.info("The file is a valid file".green);
      } else {
        logger.info("The .cru file contains error".red);
      }

      //   logger.debug(analyzer.parsedPOI);
    });
  })

  // SPEC_1 search rooms being used given a course
  .command("recherche-salle", "Free text search on rooms given a course's name")
  .argument("<file>", "The data file to search")
  .argument("<cours>", "The text to look for in courses' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      // test
      // var jsonData = JSON.parse(data);
      // var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.cours);
        var filtered = analyzer.parsedData.filter((p) =>
          p.course.match(n, "i")
        );

        var info = filtered[0].classes.map((item) => {
          console.log(item);

          let f = {
            nom_salle: item.room,
            capacite: item.capacity,
            batiment: item.room.charAt(0),
          };

          return f;
        });

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The .cru file contains error".red);
      }
    });
  })

  // SPEC_2 show rooms' capacity given a room name
  .command(
    "capacite-salle",
    "Free text search on room's capacity given its name"
  )
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      // // test
      // var jsonData = JSON.parse(data);
      // var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.room);
        var filtered = analyzer.parsedData
          .flatMap((p) => p.classes)
          .find((item) => item.room.match(n));

        if (filtered) {
          var result = {
            nom_salle: filtered.room,
            capacite: filtered.capacity,
          };
        }

        logger.info("%s", JSON.stringify(result, null, 2));
      } else {
        logger.info("The .cru file contains error".red);
      }
    });
  })

  // SPEC_3 show if room is available a day and a timeslot
  .command("disponibilite-salle", "Check room's availability given its name")
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      // var jsonData = JSON.parse(data);
      // var analyzer = { errorCount: 0, parsedData: jsonData };

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.room);
        var filtered = analyzer.parsedData
          .flatMap((p) => p.classes)
          .filter((p) => p.room.match(n, "i"));

        days = ["L", "MA", "ME", "J", "V", "S", "D"];

        var ans = days.forEach((day) => {
          let todayClasses = filtered.filter((item) => item.weekday === day);
          var availability = [];

          if (todayClasses.length > 0) {
            todayClasses = todayClasses.sort((a, b) => {
              if (a.startTime < b.startTime) return -1;
              if (a.startTime > b.startTime) return 1;
              return 0;
            });

            for (let i = 0; i < todayClasses.length; i++) {
              if (i === 0 && !(todayClasses[i].startTime === "08:00")) {
                let slot = "08:00-" + todayClasses[i].startTime;
                availability.push(slot);
              }

              if (
                todayClasses[i + 1] &&
                todayClasses[i].endTime < "20:00" &&
                todayClasses[i].endTime !== todayClasses[i + 1].startTime
              ) {
                let slot =
                  todayClasses[i].endTime + "-" + todayClasses[i + 1].startTime;
                availability.push(slot);
              }

              if (!todayClasses[i + 1] && todayClasses[i].endTime < "20:00") {
                let slot = todayClasses[i].endTime + "-20:00";
                availability.push(slot);
              }
            }
          } else {
            availability.push("08:00-20:00");
          }

          // console.log(`${day}: ` + availability);
          logger.info(`${day}: %s`, JSON.stringify(availability, null, 2));
        });
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // SPEC_4 show if room's available given a timeslot
  .command("salles-disponibles", "Check rooms available given a timeslot")
  .argument("<file>", "The data file to search")
  .argument("<room>", "The text to look for in rooms' names")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.course);
        var filtered = analyzer.parsedData.filter((p) => p.name.match(n, "i"));
        // Check which rooms are available in a specific timeslot; since there's no date, use the current day
        // L'utilisateur reçoit la liste des salles disponibles pour l'horaire donné, sous forme de tableau avec nom de la salle, capacité et bâtiment.

        var info = [
          {
            name: filtered.roomName,
            capacite: filtered.roomCapacity,
            batiment: filtered.roomBatiment,
          },
          {
            name: filtered.roomName,
            capacite: filtered.roomCapacity,
            batiment: filtered.roomBatiment,
          },
        ];

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // SPEC_5 export iCalendar
  .command("generer-icalendar", "Generate iCalendar file for a period")
  .argument("<file>", "The data file to search")
  .argument("<date_debut>", "Start of the searched period in format YYYY-MM-DD")
  .argument("<date_fin>", "End of the searched period in format YYYY-MM-DD")
  .argument("<cours>", "Course searched to export")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var n = new RegExp(args.course);
        var filtered = analyzer.parsedData.filter((p) => p.name.match(n, "i"));
        //
        // L'utilisateur reçoit la liste des salles disponibles pour l'horaire donné, sous forme de tableau avec nom de la salle, capacité et bâtiment.

        var info = [
          {
            name: filtered.roomName,
            capacite: filtered.roomCapacity,
            batiment: filtered.roomBatiment,
          },
          {
            name: filtered.roomName,
            capacite: filtered.roomCapacity,
            batiment: filtered.roomBatiment,
          },
        ];

        logger.info("%s", JSON.stringify(info, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // SPEC_6 generate chart
  .command(
    "taux-occupation",
    "Compute the average note of each POI and export a Vega-lite chart"
  )
  .argument("<file>", "The data file to use")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var avg = analyzer.parsedData.map((p) => {
          var m = 0;
          // compute the average for each POI
          if (p.ratings.length > 0) {
            m =
              p.ratings.reduce((acc, elt) => acc + parseInt(elt), 0) /
              p.ratings.length;
          }
          p["averageRatings"] = m;
          return p;
        });

        var avgChart = {
          //"width": 320,
          //"height": 460,
          data: {
            values: avg,
          },
          mark: "bar",
          encoding: {
            x: {
              field: "name",
              type: "nominal",
              axis: { title: "Restaurants' name." },
            },
            y: {
              field: "averageRatings",
              type: "quantitative",
              axis: { title: "Average ratings for " + args.file + "." },
            },
          },
        };

        const myChart = vegalite.compile(avgChart).spec;

        /* SVG version */
        var runtime = vg.parse(myChart);
        var view = new vg.View(runtime).renderer("svg").run();
        var mySvg = view.toSVG();
        mySvg.then(function (res) {
          fs.writeFileSync("./result.svg", res);
          view.finalize();
          logger.info("%s", JSON.stringify(myChart, null, 2));
          logger.info("Chart output : ./result.svg");
        });

        /* Canvas version */
        /*
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result.png");
			})			
			*/
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // abc
  .command("classement-salles", "Organize rooms in an an array ordered by size")
  .argument("<file>", "The .cru file to group by")
  .argument("<ordre>", "The type of order")
  .action(({ args, options, logger }) => {
    fs.readFile(args.file, "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      analyzer = new Parser();
      analyzer.parse(data);

      if (analyzer.errorCount === 0) {
        var abc = analyzer.parsedPOI.reduce(function (acc, elt) {
          var idx = elt.name.charAt(0);
          if (acc[idx]) {
            acc[idx].push(elt);
          } else {
            acc[idx] = [elt];
          }
          return acc;
        }, {});

        logger.info("%s", JSON.stringify(abc, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  });

cli.run(process.argv.slice(2));