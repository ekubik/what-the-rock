const { AuthenticationError } = require("apollo-server-express");
const { User, Rock } = require("../models");
const { signToken } = require("../utils/auth");
const ObjectId = require("mongodb").ObjectId;

const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate("rocks");
    },
    user: async (parent, { username }) => {
      console.log(username);
      return User.findOne({ username }).populate("rocks");
    },
    rocks: async () => {
      return Rock.find();
    },
    rock: async (parent, { rockId }) => {
      return Rock.findOne({ _id: rockId });
    },
    myprofile: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ username: context.user.username }).populate(
          "rocks"
        );
      }
      throw new AuthenticationError("You must log in to view your profile");
    },
  },
  Mutation: {
    newUser: async (
      parent,
      { firstName, lastName, username, email, password }
    ) => {
      const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
      });
      const token = signToken(user);
      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    addRock: async (parent, { name, description, dateCollected }, context) => {
      if (context.user) {
        const rock = await Rock.create({
          name,
          description,
          dateCollected,
          user: context.user.username,
        });

        await User.findOneAndUpdate(
          { username: context.user.username },
          { $push: { rocks: { _id: rock._id } } },
          {
            new: true,
          }
        );
        return rock;
      }
      throw new AuthenticationError(
        "You need to be logged in to create a new rock"
      );
    },

    /*addRock: async (parent, args, context) => {
      console.log(args);
      if (context.user) {
        const rock = await Rock.create({
         ...args,
          user: context.user.username,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { rocks: rock._id } }
        );
        return rock;
      }
      throw new AuthenticationError(
        "You need to be logged in to create a new rock"
      );
    },*/
    deleteRock: async (_, rockId, context) => {
      console.log("What");
      console.log(rockId.rockId);
      console.log(`user ${context.user.username}`);
      if (context.user) {
        console.log("findoneandelete");
        try {
          await Rock.findOneAndDelete({
            _id: ObjectId(rockId.rockId),
          });
        } catch (err) {
          console.log("error", err);
        }

        await User.findOneAndUpdate(
          {
            username: context.user.username,
          },
          { $pull: { rocks: ObjectId(rockId.rockId) } },
          {
            new: true,
            runValidators: true,
          }
        );
        return "Success";
      }
      throw new AuthenticationError("Please log in to delete a rock");
    },
    addComment: async (parent, { rockId, commentBody }, context) => {
      if (context.user) {
        return Rock.findOneAndUpdate(
          {
            _id: rockId,
          },
          {
            $addToSet: {
              comments: { commentBody, author: context.user.username },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    deleteComment: async (parent, { rockId, commentId }, context) => {
      console.log(commentId);
      if (context.user) {
        return Rock.findOneAndUpdate(
          { _id: ObjectId(rockId.rockId) },
          {
            $pull: {
              comments: {
                commentId: ObjectId(commentId),
              },
            },
          },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
